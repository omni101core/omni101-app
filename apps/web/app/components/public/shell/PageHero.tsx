import {type ReactNode} from 'react';
export function PageHero({kicker,title,text}:{kicker:string;title:ReactNode;text:string}){return <section className="page-hero"><span className="eyebrow">{kicker}</span><h1>{title}</h1><p>{text}</p></section>}
