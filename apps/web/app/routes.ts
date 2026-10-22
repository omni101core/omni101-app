import {route,index, type RouteConfig} from '@react-router/dev/routes';
export default [index('routes/home.tsx'),route('admin/*','routes/admin.tsx'),route('portal/*','routes/portal.tsx'),route('*','routes/public.tsx')] satisfies RouteConfig;
