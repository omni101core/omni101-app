import VisionLab from '../components/vision/VisionLab';
import {PublicShell} from '../components/public/capabilities/PublicShell';

export function meta(){return [{title:'Vision Lab · OMNI101'},{name:'description',content:'Laboratorio gestuale nel browser. La webcam è facoltativa e i fotogrammi restano sul dispositivo.'},{property:'og:title',content:'Vision Lab · OMNI101'},{property:'og:url',content:'https://omni101.app/explore/vision'},{tagName:'link',rel:'canonical',href:'https://omni101.app/explore/vision'}]}
export default function PlaygroundVision(){return <PublicShell routeKey="explore/vision"><VisionLab/></PublicShell>}
