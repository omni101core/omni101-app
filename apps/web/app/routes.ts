import {route, type RouteConfig} from '@react-router/dev/routes';
export default [route('admin/*','routes/admin.tsx'),route('portal/*','routes/portal.tsx'),route('*','routes/public.tsx')] satisfies RouteConfig;
