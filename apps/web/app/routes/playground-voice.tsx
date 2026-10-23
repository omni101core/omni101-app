import VoiceDemo from '../components/voice/VoiceDemo';
import {PublicShell} from '../components/public/capabilities/PublicShell';
import {LabStatus} from './public/product-labs';

export function meta(){return [{title:'Voce · OMNI101'},{name:'description',content:'Demo vocale con le API del browser. Il microfono parte solo su richiesta e i comandi si possono scrivere.'},{property:'og:title',content:'Voce · OMNI101'},{property:'og:url',content:'https://omni101.app/explore/voice'},{tagName:'link',rel:'canonical',href:'https://omni101.app/explore/voice'}]}
export default function PlaygroundVoice(){return <PublicShell routeKey="explore/voice"><div className="lab-status-wrap"><LabStatus kind="PARZIALE" limit="Nessun provider vocale a pagamento; microfono solo su richiesta."/><VoiceDemo/></div></PublicShell>}
