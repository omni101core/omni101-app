import {readFileSync} from 'node:fs';
import {describe,expect,test} from 'vitest';

const read=(path:string)=>readFileSync(path,'utf8');
const pxUnder12=/font(?:-size)?:\s*(?:[0-9]|1[01])px/;

describe('ux-b2 voice copy and touch targets',()=>{
 test('voice slab and showcase labels stay at least 12px',()=>{
  expect(read('apps/web/app/components/showcase/showcase.css')).not.toMatch(pxUnder12);
  expect(read('apps/web/app/styles/cinematic.css')).not.toMatch(pxUnder12);
  const capitolo=read('apps/web/app/styles/home-capitolo.css');
  expect(capitolo).toContain('.capitolo-num{font-size:12px;');
  expect(capitolo).toContain('.capitolo-cards footer small{font-size:12px;');
 });
 test('the voice paragraph is not in both the sticky hero and the card at once',()=>{
  const cinema=read('apps/web/app/components/public/CinematicExperience.tsx');
  expect(cinema).toContain('{!reduced&&<p>{current.body}</p>}');
  expect(cinema).toContain('aria-hidden={reduced?undefined:true}');
  expect(cinema.match(/<p>\{chapter\.body\}<\/p>/g)).toHaveLength(1);
  expect(read('apps/web/app/components/public/HomeShowcase.tsx').match(/Scegli una scena e premi play/g)).toHaveLength(1);
 });
 test('filter chips, catalog actions and the work sector control are at least 44px',()=>{
  expect(read('apps/web/app/components/public/Filters.tsx')).toContain('minWidth:44,minHeight:44');
  const catalog=read('apps/web/app/styles/capabilities.css');
  expect(catalog).toContain('.cap-filter button{min-width:44px;min-height:44px;font-size:12px}');
  expect(catalog).toContain('.cap-link,.cap-families a{display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px;min-width:44px}');
  expect(read('apps/web/app/styles/work-studio.css')).toContain('.work-sector select{font:inherit;min-width:44px;min-height:44px;');
  expect(read('apps/web/app/components/showcase/showcase.css')).toContain('.sc-chips button{min-width:44px;min-height:44px;');
 });
});
