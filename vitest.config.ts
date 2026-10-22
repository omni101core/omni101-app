import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['packages/**/*.test.ts','apps/web/app/server/**/*.test.ts','tests/**/*.test.ts'],environment:'node'}});
