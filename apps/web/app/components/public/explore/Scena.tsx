import {BancoVoce,Binario,Vetrina} from '../../showcase';
import ScenaCreate from './ScenaCreate';
import ScenaVision from './ScenaVision';
import type {Scena as Id} from './stations';

/** The playable scene inside a station card. Each one starts without an account, a camera or a microphone. */
export default function Scena({id}:{id:Id}){
 if(id==='voce')return <BancoVoce compatto segmento="studio"/>;
 if(id==='vetrina')return <Vetrina ritaglio/>;
 if(id==='binario')return <Binario nodi={6} segmento="generico"/>;
 if(id==='create')return <ScenaCreate/>;
 return <ScenaVision/>;
}
