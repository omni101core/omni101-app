import {reactRouter} from '@react-router/dev/vite';
import {cloudflare} from '@cloudflare/vite-plugin';
import {paraglideVitePlugin} from '@inlang/paraglide-js';
import {defineConfig} from 'vite';
// Messages compile to app/paraglide (git-ignored by its own .gitignore). The locale is passed to each message call from the route, so no AsyncLocalStorage or middleware is needed on Workers.
export default defineConfig({plugins:[paraglideVitePlugin({project:'./project.inlang',outdir:'./app/paraglide',strategy:['baseLocale']}),cloudflare({viteEnvironment:{name:'ssr'}}),reactRouter()]});
