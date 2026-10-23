import {it,expect} from 'vitest';
import {criticalPath} from '../apps/web/app/server/planning';
import {prioritize} from '../apps/web/app/server/operations';
it('computes remaining critical path and slack across parallel branches',()=>{
 const tasks=[{id:'a',name:'Brief',status:'DONE',estimate_minutes:60},{id:'b',name:'Build',status:'TODO',estimate_minutes:240},{id:'c',name:'Copy',status:'TODO',estimate_minutes:60},{id:'d',name:'QA',status:'TODO',estimate_minutes:60}];
 const result=criticalPath(tasks,[{task_id:'b',depends_on_task_id:'a'},{task_id:'c',depends_on_task_id:'a'},{task_id:'d',depends_on_task_id:'b'},{task_id:'d',depends_on_task_id:'c'}]);
 expect(result.remainingMinutes).toBe(300);expect(result.items.find(t=>t.id==='c')?.slackMinutes).toBe(180);expect(result.items.find(t=>t.id==='b')?.critical).toBe(true);
 expect(()=>criticalPath(tasks,[{task_id:'a',depends_on_task_id:'b'},{task_id:'b',depends_on_task_id:'a'}])).toThrow(/ciclo/);
});
it('prioritizes overdue work before urgency and then date without mutating inputs',()=>{
 const tasks=[{name:'Urgent future',priority:'URGENT',due_date:'2027-01-01'},{name:'Overdue low',priority:'LOW',due_date:'2026-01-01'},{name:'Earlier high',priority:'HIGH',due_date:'2026-12-01'}];
 expect(prioritize(tasks,'2026-10-22').map(t=>t.name)).toEqual(['Overdue low','Urgent future','Earlier high']);expect(tasks[0].name).toBe('Urgent future');
});
