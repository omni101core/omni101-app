import {readdirSync,readFileSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';
import {describe,expect,it} from 'vitest';

/** REGIA-MOTION rule 1: a signature effect lives on one page of the site. This guards the home-only ones. */
const app=join(__dirname,'..','apps','web','app');
const files:string[]=[];
const walk=(dir:string)=>{for(const name of readdirSync(dir)){const path=join(dir,name);if(statSync(path).isDirectory())walk(path);else if(/\.tsx?$/.test(name))files.push(path)}};
walk(app);
const users=(component:string)=>files.filter(file=>!file.endsWith(component+'.tsx')&&new RegExp('<'+component+'\\b').test(readFileSync(file,'utf8'))).map(file=>relative(app,file));

describe('signature effects stay on one page',()=>{
 it('the reel ring is only used by the home',()=>expect(users('ReelOrbit')).toEqual(['routes/public/home.tsx']));
 it('the curved-wall chapters are only used by the home',()=>expect(users('CinematicExperience')).toEqual(['routes/public/home.tsx']));
 it('the headline image expansion is not on the home',()=>expect(users('ImageExpansionTypography')).not.toContain('routes/public/home.tsx'));
 it('the retired home effects are not on the home',()=>{
  const home=readFileSync(join(app,'routes/public/home.tsx'),'utf8');
  for(const retired of ['SpatialGallery','PortalCanvas','PortalSection','PortalNarrative','rotateY'])expect(home).not.toContain(retired);
 });
});
