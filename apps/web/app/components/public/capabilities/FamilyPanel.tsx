import {type CSSProperties,type MouseEvent} from 'react';
import {Link} from 'react-router';
import {availabilityLabel,type FamilyPanel as Family} from './panels';
import {familyImage} from './panelMedia';

/** The text blocks of one family: claim, the concrete case, the other solutions and the actions. The static panel and
 * the caption under the wheel lay them out differently, so this returns the blocks and the parent owns the grid. */
export function FamilyDetail({p,link,onCatalog}:{p:Family;link:boolean;onCatalog:(event:MouseEvent<HTMLAnchorElement>)=>void}){
 return <>
  <p className="cap-claim">{p.claim}</p>
  <div className="cap-case">
   <small>Un’applicazione concreta</small>
   <strong>{p.featured.title}</strong>
   <p>{p.featured.example}</p>
   <span className="cap-badge" data-availability={p.featured.availability}>{availabilityLabel[p.featured.availability]}</span>
  </div>
  <ul className="cap-also" aria-label={'Altre soluzioni '+p.name}>{p.also.map(c=><li key={c.id}>{c.title}</li>)}<li>{p.count} soluzioni</li></ul>
  <div className="cap-actions">
   {link?<Link className="button" to={'/solutions/'+p.slug}>Tutte le soluzioni {p.name} ↗</Link>:<a className="button" href="#catalogo" onClick={onCatalog}>Vedi le soluzioni ↓</a>}
   {p.featured.demo&&<Link className="cap-link" to={p.featured.demo}>Provala nel Playground ↗</Link>}
  </div>
 </>;
}

/** One family as a still panel: eyebrow, large title, big picture with the concrete case over it. Used when the wheel
 * is not shown (reduced motion, small screens) and as the hero of /solutions/:family. */
export function Panel({p,i,active,link,onCatalog}:{p:Family;i:number;active:boolean;link:boolean;onCatalog:(event:MouseEvent<HTMLAnchorElement>)=>void}){
 const image=familyImage(p.slug);
 return <article className="cap-panel" data-family={p.slug} data-active={active} style={{'--i':i} as CSSProperties}>
  <span className="eyebrow">0{i+1} / {p.name} / {p.title}</span>
  <h2 className="cap-title">{p.headline}</h2>
  <figure className="cap-media" data-fallback={image.fallback?'true':undefined}>
   {image.fallback
    ?<div className="cap-art" role="img" aria-label={image.alt} style={image.style}/>
    :<img className="cap-art" src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async"/>}
   <figcaption className="cap-over"><FamilyDetail p={p} link={link} onCatalog={onCatalog}/></figcaption>
  </figure>
 </article>;
}
