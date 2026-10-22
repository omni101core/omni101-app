import {type ReactNode} from 'react';
import {RevealTitle} from './RevealTitle';
export function PageHero({kicker,title,text}:{kicker:string;title:ReactNode;text:string}){return <section className="page-hero"><span className="eyebrow">{kicker}</span><RevealTitle as="h1">{title}</RevealTitle><p>{text}</p></section>}
