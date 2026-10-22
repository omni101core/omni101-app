import {describe,expect,it} from 'vitest';
import {DEAL,RING_CLOSED,RING_OPEN,loadProgress,ringPose,ringScene,slotAngle} from '../apps/web/app/components/public/reel-ring';

const slots=12;
const angles=Array.from({length:slots},(_,slot)=>slotAngle(slot,slots,0));

describe('reel ring geometry',()=>{
 it('folds every slot to -180..180 and keeps them evenly spaced',()=>{
  for(const spin of [0,37,-410,720.5]){
   const turned=Array.from({length:slots},(_,slot)=>slotAngle(slot,slots,spin));
   for(const angle of turned){expect(angle).toBeGreaterThanOrEqual(-180);expect(angle).toBeLessThan(180)}
   const sorted=[...turned].sort((a,b)=>a-b);
   for(let i=1;i<slots;i++)expect(sorted[i]-sorted[i-1]).toBeCloseTo(360/slots,6);
  }
 });

 it('interpolates the scene from the closed ring to the open carousel',()=>{
  expect(ringScene(0)).toEqual(RING_CLOSED);
  expect(ringScene(1)).toEqual(RING_OPEN);
  expect(ringScene(-3)).toEqual(RING_CLOSED);
  expect(ringScene(9)).toEqual(RING_OPEN);
  const half=ringScene(.5);
  expect(half.radius).toBeCloseTo((RING_CLOSED.radius+RING_OPEN.radius)/2,6);
  expect(half.scale).toBeLessThan((RING_CLOSED.scale+RING_OPEN.scale)/2);
 });

 it('puts every dealt card on one circle',()=>{
  for(const angle of angles){
   const pose=ringPose(angle,1,RING_OPEN.radius);
   expect(Math.hypot(pose.x,pose.z)).toBeCloseTo(RING_OPEN.radius,6);
   expect(pose.yaw).toBeCloseTo(angle,6);
   expect(pose.appear).toBe(1);
  }
 });

 it('starts with one stack at the front that nobody can see',()=>{
  for(const angle of angles){
   const pose=ringPose(angle,0,RING_CLOSED.radius);
   expect(pose.appear).toBe(0);
   expect(pose.x).toBeCloseTo(0,6);
   expect(pose.yaw).toBeCloseTo(0,6);
  }
 });

 it('deals the cards one after another around the ring',()=>{
  const sorted=[...angles].sort((a,b)=>a-b);
  const firstSeen=(angle:number)=>{for(let f=0;f<=1;f+=.005)if(ringPose(angle,f,RING_OPEN.radius).appear>0)return f;return 2};
  const starts=sorted.map(firstSeen);
  for(let i=1;i<starts.length;i++)expect(starts[i]).toBeGreaterThan(starts[i-1]);
  expect(DEAL).toBeGreaterThan(0);
  expect(DEAL).toBeLessThan(1);
 });

 it('swings each card from the stack to its own angle',()=>{
  const angle=angles.find(a=>a>0)!;
  const radius=RING_OPEN.radius;
  const order=(angle+180)/360,start=order*(1-DEAL),mid=start+DEAL/2,end=start+DEAL;
  const at=(f:number)=>ringPose(angle,f,radius).yaw;
  expect(at(start)).toBeCloseTo(0,6);
  expect(at(end)).toBeCloseTo(angle,6);
  expect(at(mid)).toBeGreaterThan(angle/2);
 });

 it('never lets the counter run ahead of the loaded covers',()=>{
  expect(loadProgress(0,10,1)).toBe(0);
  expect(loadProgress(5,10,1)).toBe(50);
  expect(loadProgress(10,10,.4)).toBe(40);
  expect(loadProgress(10,10,1)).toBe(100);
  expect(loadProgress(0,0,.7)).toBe(70);
 });
});
