import {offerText,offers,MOSTRA_PREZZI} from '../components/public/landing/offers';
import {t} from '../components/public/shell/i18n';
import {offerPrice,siteOrigin} from './seo';
/** Text for AI engines. Facts only, copied from the site strings and the pricing engine file; no claims of its own. */
const money=(n:number,c:string)=>new Intl.NumberFormat('en',{style:'currency',currency:c,maximumFractionDigits:0}).format(n);
function priceLine(o:(typeof offers)[number],show:boolean){
 const p=offerPrice(o,show);if(!p)return t('landing_fixed_quote','en');
 return [p.oneOff>0?'one-off from '+money(p.oneOff,p.currency):'',p.monthly>0?'monthly from '+money(p.monthly,p.currency):''].filter(Boolean).join(', ');
}
const head=()=>`# OMNI101\n\n> ${t('studio_hero_text','en')}\n\nWebsite: ${siteOrigin} (Italian; English pages under ${siteOrigin}/en). Contact: info@omni101.app. Brand spellings: OMNI101, omni101, omni101.app.\n`;
export function llmsTxt(show=MOSTRA_PREZZI){
 const list=offers.map(o=>{const x=offerText(o,'en');return `- [${x.name}](${siteOrigin}/en/offers/${o.slug}): ${x.tagline} Price: ${priceLine(o,show)}.`}).join('\n');
 return `${head()}\n## Offers\n\n${list}\n\nEvery offer starts with a free personalized mini-demo. ${t('landing_home_meta_description','en')}\n\n## Pages\n\n- [Home (Italian)](${siteOrigin}/)\n- [Home (English)](${siteOrigin}/en)\n- [Projects](${siteOrigin}/en/work): ${t('work_hero_text','en')}\n- [Studio](${siteOrigin}/en/studio): ${t('studio_hero_text','en')}\n- [Start a project (Italian)](${siteOrigin}/start-project)\n- [Insights](${siteOrigin}/en/insights): ${t('insights_home_text','en')}\n- [Privacy](${siteOrigin}/privacy)\n- [Terms](${siteOrigin}/terms)\n\n## Optional\n\n- [Full description](${siteOrigin}/llms-full.txt)\n- [Sitemap](${siteOrigin}/sitemap.xml)\n`;
}
export function llmsFull(show=MOSTRA_PREZZI){
 const body=offers.map(o=>{const x=offerText(o,'en');return `## ${x.name}\n\nURL: ${siteOrigin}/en/offers/${o.slug}\nPrice: ${priceLine(o,show)}\n\n${x.what}\n\nWhat you get:\n${x.get.map(g=>'- '+g).join('\n')}\n\nWhat we need from you:\n${x.needs.map(g=>'- '+g).join('\n')}\n`}).join('\n');
 return `${head()}\n${show?'Prices are starting points ("from") taken from the OMNI101 pricing engine.':t('landing_fixed_quote','en')+'.'} The projects on the site are studio concepts, not client results.\n\n${body}`;
}
