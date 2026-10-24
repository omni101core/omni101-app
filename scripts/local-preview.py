#!/usr/bin/env python3
"""Reuse a successful CI artifact in the existing owned preview; never start a server."""
import argparse
import datetime
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import subprocess
import tempfile
import urllib.request
import zipfile

REPO = 'omni101core/omni101-app'
CONFIG = Path('/tmp/omni101-preview-3af1af4/local.json')
LIMIT = 150 * 1024 * 1024

def fail(message):
    raise RuntimeError(message)

def gh_json(path):
    result = subprocess.run(['gh', 'api', path], capture_output=True, check=False)
    if result.returncode:
        fail('GitHub metadata unavailable; no local changes applied.')
    return json.loads(result.stdout)

def config():
    if CONFIG.is_symlink() or not CONFIG.is_file():
        fail('Owned preview config unavailable.')
    data = json.loads(CONFIG.read_text())
    if not isinstance(data.get('vars'), dict) or not isinstance(data.get('assets'), dict):
        fail('Unexpected owned preview configuration.')
    return data

def atomic(path, data):
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as output:
        temporary = Path(output.name)
        output.write((json.dumps(data, indent=2) + '\n').encode())
        output.flush()
        os.fsync(output.fileno())
    os.replace(temporary, path)

def status():
    data = config()
    result = {'configuredRevision': data['vars'].get('BUILD_REVISION')}
    try:
        with urllib.request.urlopen('http://127.0.0.1:4177/api/health', timeout=4) as response:
            health = json.loads(response.read(16384))
        result['health'] = {key: health.get(key) for key in ('revision', 'storage', 'database')}
    except Exception:
        result['health'] = 'unavailable'
    proof = Path(data['main']).parent.parent / 'preview-source.json'
    if proof.is_file() and not proof.is_symlink():
        source = json.loads(proof.read_text())
        result['source'] = {key: source.get(key) for key in ('sha', 'run', 'status', 'conclusion', 'verification', 'testScope')}
    print(json.dumps(result))

def download(artifact, destination):
    with destination.open('xb') as output:
        process = subprocess.Popen(['gh', 'api', f'repos/{REPO}/actions/artifacts/{artifact}/zip'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        total = 0
        try:
            while chunk := process.stdout.read(65536):
                total += len(chunk)
                if total > LIMIT:
                    fail('Artifact download exceeds size bound.')
                output.write(chunk)
            if process.wait() != 0:
                fail('Artifact download unavailable.')
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()

def extract(archive, destination):
    selected = []
    total = 0
    seen = set()
    layouts = set()
    with zipfile.ZipFile(archive) as bundle:
        if len(bundle.infolist()) > 12000:
            fail('Artifact entry count exceeds bound.')
        for entry in bundle.infolist():
            path = PurePosixPath(entry.filename)
            if path.is_absolute() or '..' in path.parts or '\\' in entry.filename or stat.S_ISLNK(entry.external_attr >> 16):
                fail('Unsafe artifact path or symlink.')
            # Two layouts of the same build: nested under apps/web/build (old) or server/ and client/ at the root (new).
            if tuple(path.parts[:4]) in (('apps', 'web', 'build', 'server'), ('apps', 'web', 'build', 'client')):
                layout, relative = 'nested', Path(*path.parts[3:])
            elif path.parts and path.parts[0] in ('server', 'client'):
                layout, relative = 'root', Path(*path.parts)
            else:
                continue
            layouts.add(layout)
            if str(relative) in seen:
                fail('Duplicate artifact path.')
            seen.add(str(relative))
            total += entry.file_size
            if total > LIMIT or entry.file_size > 50 * 1024 * 1024:
                fail('Extracted artifact exceeds size bound.')
            selected.append((entry, relative))
        if len(layouts) > 1:
            fail('Artifact mixes the nested and root build layouts.')
        if not any(str(path) == 'server/index.js' for _, path in selected) or not any(path.parts[0] == 'client' for _, path in selected):
            fail('Verified artifact lacks server/client build.')
        for entry, relative in selected:
            target = destination / relative
            if entry.is_dir():
                target.mkdir(parents=True, exist_ok=True)
            else:
                target.parent.mkdir(parents=True, exist_ok=True)
                with bundle.open(entry) as source, target.open('xb') as output:
                    shutil.copyfileobj(source, output, 65536)

def supplements(old, new):
    total = 0
    for name in ('social-review', 'email-review'):
        source = old / name
        if not source.exists():
            continue
        entries = [source, *source.rglob('*')]
        if len(entries) > 2000:
            fail('Supplemental review entry count exceeds bound.')
        for entry in entries:
            if entry.is_symlink() or not (entry.is_file() or entry.is_dir()):
                fail('Unsafe supplemental review entry.')
            if entry.is_file():
                total += entry.stat().st_size
                if total > 25 * 1024 * 1024:
                    fail('Supplemental review size exceeds bound.')
        if (new / name).exists():
            fail('Artifact conflicts with supplemental review directory.')
        shutil.copytree(source, new / name)

def update(run, apply, draft=False):
    data = config()
    info = gh_json(f'repos/{REPO}/actions/runs/{run}')
    if (info.get('head_repository') or {}).get('full_name') != REPO or info.get('event') != 'push' or info.get('head_branch') not in ('release-commercial', 'rebuild-commercial', 'verify-commercial') or info.get('path') != '.github/workflows/verify.yml':
        fail('Only trusted repository push runs from the verify workflow and approved branches are accepted.')
    sha = info.get('head_sha', '')
    if info.get('status') != 'completed' or (info.get('conclusion') != 'success' and not (draft and info.get('conclusion') == 'failure')) or len(sha) != 40 or any(c not in '0123456789abcdef' for c in sha):
        fail('Only completed successful CI runs are accepted unless --draft explicitly selects a failed build.')
    artifacts = gh_json(f'repos/{REPO}/actions/runs/{run}/artifacts?per_page=100')['artifacts']
    matches = [a for a in artifacts if a['name'] == 'omni101-verified-build' and not a.get('expired')]
    if not matches and info['head_branch'] == 'verify-commercial':
        fail('Runs on verify-commercial produce no build artifact; use a run on rebuild-commercial.')
    if len(matches) != 1 or matches[0]['size_in_bytes'] > LIMIT:
        fail('Exactly one bounded, unexpired verified build is required.')
    plan = {'run': run, 'sha': sha, 'verification': 'CI_SUCCEEDED' if info['conclusion']=='success' else 'DRAFT_NOT_VERIFIED', 'testScope': 'FULL_RELEASE_PIPELINE' if info['head_branch']=='release-commercial' else 'ISOLATED_OR_FOCUSED_CHECKS', 'apply': apply, 'serverRestarted': False}
    if apply:
        directory = Path(tempfile.mkdtemp(prefix=f'omni101-preview-{sha[:12]}-', dir='/tmp'))
        archive = directory / 'artifact.zip'
        download(matches[0]['id'], archive)
        extract(archive, directory)
        supplements(Path(data['assets']['directory']), directory / 'client')
        if config() != data:
            fail('Config changed during preparation; update abandoned.')
        backup = CONFIG.with_name('local.backup-' + datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '.json')
        shutil.copy2(CONFIG, backup)
        atomic(directory / 'preview-source.json', {**plan, 'status': info['status'], 'conclusion': info['conclusion']})
        data['main'] = str(directory / 'server/index.js')
        data['assets']['directory'] = str(directory / 'client')
        data['vars']['BUILD_REVISION'] = sha
        atomic(CONFIG, data)
        plan['backup'] = str(backup)
        plan['proof'] = str(directory / 'preview-source.json')
    print(json.dumps(plan))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('status')
    command = commands.add_parser('update')
    command.add_argument('--run', required=True, type=lambda value: value if value.isdigit() else parser.error('Numeric run ID required.'))
    command.add_argument('--apply', action='store_true')
    command.add_argument('--draft', action='store_true', help='Explicitly preview a failed trusted build; never release evidence.')
    args = parser.parse_args()
    try:
        status() if args.command == 'status' else update(args.run, args.apply, args.draft)
    except Exception as error:
        print(json.dumps({'error': str(error) if isinstance(error, RuntimeError) else 'Preview operation failed; inspect locally without printing credentials.'}))
        raise SystemExit(1)
