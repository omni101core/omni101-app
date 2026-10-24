import {publicMeta} from '../content/seo';
import VoiceDemo from '../components/voice/VoiceDemo';
import {PublicShell} from '../components/public/capabilities/PublicShell';
import {LabStatus} from './public/product-labs';

export function meta(){return publicMeta('/explore/voice')}
export default function PlaygroundVoice(){return <PublicShell routeKey="explore/voice"><div className="lab-status-wrap"><LabStatus kind="PARZIALE" limit="Nessun provider vocale a pagamento; microfono solo su richiesta."/><VoiceDemo/></div></PublicShell>}
