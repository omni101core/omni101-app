/** Permissions-Policy of the public site: every powerful feature is off, except the one device each Playground demo needs,
 * and only on its own page and only for the page itself (`self`). Voice asks for the microphone, Vision for the camera. */
export function permissionsPolicy(pathname:string){
 const path=pathname.length>1?pathname.replace(/\/+$/,''):pathname;
 return `camera=${path==='/explore/vision'?'(self)':'()'}, microphone=${path==='/explore/voice'?'(self)':'()'}, geolocation=()`;
}
