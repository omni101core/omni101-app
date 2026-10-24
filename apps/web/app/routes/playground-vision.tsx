import {publicMeta} from '../content/seo';
import VisionLab from '../components/vision/VisionLab';
import {PublicShell} from '../components/public/capabilities/PublicShell';
import {LabStatus} from './public/product-labs';

export function meta(){return publicMeta('/explore/vision')}
export default function PlaygroundVision(){return <PublicShell routeKey="explore/vision"><div className="lab-status-wrap"><LabStatus kind="PARZIALE" limit="Frame non salvati; gesti non garantiti su ogni computer." locale="it"/><VisionLab/></div></PublicShell>}
