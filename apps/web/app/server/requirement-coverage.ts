import snapshot from '../../../../docs/operativo/requirement-coverage.json';
import {HttpError,requireRole,type Env,type Identity} from './auth';

type Entry={id:string;sourceId:string;kind:string;requirement:string;acceptance:string;implementationStatus:string;operationalStatus:string;gaps:string[];[key:string]:unknown};
type Source={id:string;originalId?:string;path?:string;[key:string]:unknown};
type Snapshot={version:number;baseline:unknown;summary:unknown;candidateDefaults?:Partial<Entry>;sources:Source[];requirements:Entry[];gapQueue:unknown[]};
const coverage=snapshot as unknown as Snapshot;
const sources=coverage.sources.map(s=>({...s,id:s.originalId||s.id}));
const sourceById=new Map(coverage.sources.map(s=>[s.id,s]));
function expand(row:Entry){const source=sourceById.get(row.sourceId),defaults=row.kind==='CANDIDATE'||!row.kind?coverage.candidateDefaults||{}:{};return {...defaults,...row,sourceId:source?.originalId||row.sourceId,source:{path:source?.path,...(defaults.source as object||{}),...(row.source as object||{})}} as Entry}
export function handleRequirementCoverage(request:Request,env:Env,actor:Identity):Response|null{
 const url=new URL(request.url);
 if(url.pathname!=='/api/requirement-coverage')return null;
 requireRole(actor,['OWNER','ADMIN','PROJECT_MANAGER','DEVELOPER','DESIGNER','SALES','FINANCE']);
 if(actor.orgId!==(env.ORGANIZATION_ID||'omni101'))throw new HttpError(403,'Registro riservato al workspace OMNI101.');
 if(request.method!=='GET')throw new HttpError(405,'Registro di riconciliazione in sola lettura.');
 const q=(url.searchParams.get('q')||'').trim(),kind=url.searchParams.get('kind')||'',source=url.searchParams.get('source')||'',rawOffset=url.searchParams.get('offset')||'0';
 if(q.length>160||!/^\d{1,7}$/.test(rawOffset)||kind&&!['CANDIDATE','REQUIREMENT','MACRO_GROUP'].includes(kind)||source&&!sources.some(s=>s.id===source))throw new HttpError(400,'Filtri di copertura non validi.');
 const query=q.toLocaleLowerCase('it'),offset=Number(rawOffset),limit=25;
 const rows=coverage.requirements.map(expand).filter(r=>(!kind||r.kind===kind)&&(!source||r.sourceId===source)&&(!query||[r.id,r.sourceId,r.requirement,r.acceptance,...(r.gaps||[])].join(' ').toLocaleLowerCase('it').includes(query)));
 return Response.json({version:coverage.version,baseline:coverage.baseline,summary:coverage.summary,sources,records:rows.slice(offset,offset+limit),total:rows.length,offset,limit,hasMore:offset+limit<rows.length},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
