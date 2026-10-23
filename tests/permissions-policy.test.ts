import {describe,it,expect} from 'vitest';
import {permissionsPolicy} from '../apps/web/app/server/permissions';
describe('permissions policy',()=>{
 it('opens only the microphone on /explore/voice',()=>{expect(permissionsPolicy('/explore/voice')).toBe('camera=(), microphone=(self), geolocation=()')});
 it('opens only the camera on /explore/vision',()=>{expect(permissionsPolicy('/explore/vision')).toBe('camera=(self), microphone=(), geolocation=()')});
 it('keeps everything off elsewhere, including the neighbouring Explore pages',()=>{
  for(const path of ['/','/explore','/explore/commerce','/explore/workflow','/explore/voice/extra','/explore/voices','/solutions','/admin','/portal/x'])expect(permissionsPolicy(path)).toBe('camera=(), microphone=(), geolocation=()');
 });
 it('treats a trailing slash as the same page',()=>{expect(permissionsPolicy('/explore/voice/')).toBe('camera=(), microphone=(self), geolocation=()')});
});
