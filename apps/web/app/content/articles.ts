import it from './insights.it.json';
import en from './insights.en.json';
/** Long guides (sections, FAQ, CTA to an offer). `body` is the flat list of paragraphs and answers, so older code that only knows `body` keeps working. */
export type Article={slug:string;title:string;category:string;summary:string;body:string[];metaDescription?:string;date?:string;author?:string;sections?:{h2:string;paragraphs:string[]}[];faq?:{q:string;a:string}[];cta?:{label:string;href:string}};
export const articlesIt=it as Article[];
export const articlesEn=en as Article[];
