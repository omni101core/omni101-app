"""Publish only reviewed rebuild source to verification branch; never changes main/Pages."""
import base64,hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
REPO='omni101core/omni101-app'
import sys
CHECK_ONLY='--check' in sys.argv  # scan and list what would be published, push nothing
BRANCH='verify-commercial' if '--verify-only' in sys.argv else 'release-commercial' if '--release' in sys.argv else 'rebuild-commercial'
def api(path,payload=None):
 args=['gh','api',f'repos/{REPO}/{path}']
 if payload is not None:args+=['--method','POST','--input','-']
 process=subprocess.run(args,input=json.dumps(payload) if payload is not None else None,text=True,capture_output=True)
 if process.returncode:raise RuntimeError(process.stderr[:1000])
 return json.loads(process.stdout)
ref=subprocess.run(['gh','api',f'repos/{REPO}/git/ref/heads/{BRANCH}'],capture_output=True,text=True)
exists=ref.returncode==0
parent=json.loads(ref.stdout)['object']['sha'] if exists else api('git/ref/heads/main')['object']['sha']
SKIP_PARTS=['node_modules','.wrangler','.react-router','build','.dev.vars','.env','.DS_Store','.claude','.codex','.gemini','.cursor','.omx']  # tool task state, never source; docs/**/handoff*.md are kept
DOC_MAX_BYTES=1_000_000  # docs/ is published whole; a file above this (a heavy docs/preview asset, say) is left out and reported
paths=[];left_out=[]
for directory in ['apps/web','packages','.github/workflows','tests','docs']:
 for path in (ROOT/directory).rglob('*'):
  if not path.is_file() or any(part in SKIP_PARTS for part in path.parts):continue
  if directory=='docs' and path.stat().st_size>DOC_MAX_BYTES:left_out.append(str(path.relative_to(ROOT)));continue
  paths.append(path)
for filename in ['scripts/cloud-verify.py','scripts/seed-reviewed-context.mjs','scripts/private-mandates.mjs','scripts/project-context.mjs','scripts/local-preview.py','scripts/catalogo-listino.mjs','scripts/reconcile-requirements.mjs','scripts/i18n-check.mjs','scripts/indexnow-ping.mjs','scripts/prod-smoke.py','package.json','vitest.config.ts','playwright.config.ts','README.md','AGENTS.md','CLAUDE.md','GEMINI.md']:
 path=ROOT/filename
 if path.is_file():paths.append(path)
# Perimeter guard: tool state dirs must never reach the branch (a SKIP_PARTS regression fails here, not in CI).
TOOL_STATE=('.claude','.codex','.gemini','.cursor','.omx')
leaked=[str(p.relative_to(ROOT)) for p in paths if any(part in TOOL_STATE for part in p.parts)]
if leaked:print('Tool state in publish perimeter, nothing pushed:');print('\n'.join(leaked));sys.exit(1)
# Anti-secret scan, before anything leaves this machine. It reports file, line and rule only, never the matched text.
SECRET_RULES={
 'private key block':re.compile(r'-----BEGIN [A-Z ]*PRIVATE KEY-----'),
 'GitHub token':re.compile(r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b'),
 'API key (sk-)':re.compile(r'\bsk-[A-Za-z0-9_-]{20,}'),
 'AWS access key':re.compile(r'\bAKIA[0-9A-Z]{16}\b'),
 'Google API key':re.compile(r'\bAIza[0-9A-Za-z_-]{35}\b'),
 'Slack token':re.compile(r'\bxox[baprs]-[A-Za-z0-9-]{10,}'),
 'Tailscale key':re.compile(r'\btskey-[A-Za-z0-9-]{10,}'),
 'JWT':re.compile(r'\beyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}'),
 'bearer token':re.compile(r'\bBearer\s+[A-Za-z0-9._~+/-]{30,}'),
 'IBAN':re.compile(r'\bIT\d{2}[A-Z]\d{10}[0-9A-Z]{12}\b'),
 'URL with credentials':re.compile(r'\b[a-z][a-z0-9+.-]*://[^/\s:@]+:[^/\s:@]{3,}@'),
 'assigned secret':re.compile(r'(?i)\b(?:api[_-]?key|secret|token|password|passwd)\b[\'"]?\s*[:=]\s*[\'"][A-Za-z0-9_\-+/=.]{20,}[\'"]'),
}
hits=[]
for path in sorted(set(paths)):
 try:text=path.read_text(encoding='utf-8')
 except (UnicodeDecodeError,OSError):continue
 for number,line in enumerate(text.splitlines(),1):
  for rule,pattern in SECRET_RULES.items():
   if pattern.search(line):hits.append(f'{path.relative_to(ROOT)}:{number} {rule}')
if hits:
 print('Secret scan failed, nothing pushed. Remove or replace with a placeholder:');print('\n'.join(hits));sys.exit(1)
if left_out:print('Left out of docs (over '+str(DOC_MAX_BYTES)+' bytes):',', '.join(left_out))
if CHECK_ONLY:print(json.dumps({'check':'ok','files':len(set(paths)),'pushed':False}));sys.exit(0)
remote_tree=api(f'git/trees/{parent}?recursive=1')
known_blobs={item['sha'] for item in remote_tree['tree'] if item['type']=='blob'}
known_paths={item['path']:item['sha'] for item in remote_tree['tree'] if item['type']=='blob'}
tree=[]
for path in sorted(set(paths)):
 data=path.read_bytes();relative=str(path.relative_to(ROOT));blob_sha=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
 if known_paths.get(relative)==blob_sha:continue
 entry={'path':relative,'mode':'100644','type':'blob'}
 if blob_sha in known_blobs:entry['sha']=blob_sha
 else:
  try:content=data.decode('utf-8')
  except UnicodeDecodeError:content=None
  if content is not None and len(data)<=65536:entry['content']=content
  else:entry['sha']=api('git/blobs',{'content':base64.b64encode(data).decode(),'encoding':'base64'})['sha']
 tree.append(entry)
# Preserve the existing tree; reviewed additions/updates do not implicitly delete omitted files.
created=api('git/trees',{'base_tree':remote_tree['sha'],'tree':tree})
commit=api('git/commits',{'message':'Rebuild OMNI101 commercial application independently of ceo-os','tree':created['sha'],'parents':[parent]})
if exists:
 result=subprocess.run(['gh','api',f'repos/{REPO}/git/refs/heads/{BRANCH}','--method','PATCH','--input','-'],input=json.dumps({'sha':commit['sha'],'force':False}),text=True,capture_output=True)
 if result.returncode:raise RuntimeError(result.stderr)
else:api('git/refs',{'ref':'refs/heads/'+BRANCH,'sha':commit['sha']})
print(json.dumps({'branch':BRANCH,'sha':commit['sha'],'files':len(set(paths)),'changed_files':len(tree),'production_changed':False}))
