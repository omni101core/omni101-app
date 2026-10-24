import {useEffect,useState,type ReactNode} from 'react';
import {PageHero} from '../../components/public/shell/PageHero';
import {t,useLocale} from '../../components/public/shell/i18n';

export type LabKind='REALE'|'SIMULATA'|'PARZIALE'|'RAPPRESENTATIVA';

/** Badge realtà lab: etichetta + cosa NON fa. Visibile, non tooltip. */
export function LabStatus({kind,limit,locale}:{kind:LabKind;limit:string;locale:ReturnType<typeof useLocale>}):ReactNode{
  const kindLabels:Record<LabKind,string>={
    REALE:t('product_labs_kind_reale',locale),
    SIMULATA:t('product_labs_kind_simulata',locale),
    PARZIALE:t('product_labs_kind_parziale',locale),
    RAPPRESENTATIVA:t('product_labs_kind_rappresentativa',locale),
  };
  return <p className="lab-status" data-lab-status={kind}><span className="lab-status-kind">{kindLabels[kind]}</span><span className="lab-status-limit">{limit}</span></p>;
}

export function AvatarLab(){
  const locale=useLocale();
  const [language,setLanguage]=useState<keyof typeof scripts>('it');
  const [script,setScript]=useState(t('product_labs_avatar_script_default',locale));
  const [presenter,setPresenter]=useState(t('product_labs_avatar_option_presenter_editoriale',locale));
  const [preview,setPreview]=useState(false);
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
  const [voice,setVoice]=useState('');
  const [audio,setAudio]=useState(false);

  useEffect(()=>{
    if(!('speechSynthesis' in window))return;
    setAudio(true);
    const update=()=>setVoices(speechSynthesis.getVoices());
    update();
    speechSynthesis.addEventListener('voiceschanged',update);
    return()=>{speechSynthesis.removeEventListener('voiceschanged',update);speechSynthesis.cancel()};
  },[]);

  const scripts={it:t('product_labs_avatar_script_default',locale),en:'Welcome. Discover how we turn your idea into a digital experience.',fr:'Bienvenue. Découvrez comment nous transformons votre idée en expérience numérique.'};

  return (
    <>
      <PageHero
        kicker={t('product_labs_avatar_kicker',locale)}
        title={<>{t('product_labs_avatar_title_demo',locale)}<br/><em>{t('product_labs_avatar_title_langs',locale)}</em></>}
        text={t('product_labs_avatar_text',locale)}
      />
      <LabStatus kind="RAPPRESENTATIVA" limit={t('product_labs_avatar_limit',locale)} locale={locale} />
      <section className="section lab-product-grid">
        <form className="demo-surface" onSubmit={e=>{e.preventDefault();setPreview(true)}}>
          <label htmlFor="avatar-script">{t('product_labs_avatar_label_script',locale)}</label>
          <textarea id="avatar-script" value={script} maxLength={1500} required onChange={e=>{setScript(e.target.value);setPreview(false)}} />
          <label>{t('product_labs_avatar_label_script_lang',locale)}
            <select value={language} onChange={e=>{const lang=e.target.value as keyof typeof scripts;setLanguage(lang);setScript(scripts[lang]);setPreview(false)}}>
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </label>
          <label>{t('product_labs_avatar_label_presenter_dir',locale)}
            <select value={presenter} onChange={e=>setPresenter(e.target.value)}>
              <option>{t('product_labs_avatar_option_presenter_editoriale',locale)}</option>
              <option>{t('product_labs_avatar_option_presenter_accoglienza',locale)}</option>
              <option>{t('product_labs_avatar_option_presenter_formazione',locale)}</option>
            </select>
          </label>
          <label>{t('product_labs_avatar_label_voice',locale)}
            <select value={voice} onChange={e=>setVoice(e.target.value)}>
              <option value="">{t('product_labs_avatar_option_default_voice',locale)}</option>
              {voices.filter(v=>v.lang.startsWith(language)).map(v=><option key={v.voiceURI} value={v.voiceURI}>{v.name} / {v.lang}</option>)}
            </select>
          </label>
          <div className="lab-view-switch">
            <button type="button" className="button ghost" disabled={!audio||!script.trim()} onClick={()=>{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(script);utterance.lang=language;utterance.voice=voices.find(v=>v.voiceURI===voice&&v.lang.startsWith(language))||null;speechSynthesis.speak(utterance)}}>{t('product_labs_avatar_btn_listen',locale)}</button>
            <button type="button" className="button ghost" disabled={!audio} onClick={()=>speechSynthesis.cancel()}>{t('product_labs_avatar_btn_stop',locale)}</button>
          </div>
          {audio?null:<p className="demo-note">{t('product_labs_avatar_note_no_speech',locale)}</p>}
          <p className="demo-note">{t('product_labs_avatar_note_demo',locale)}</p>
          <button className="button" type="submit">{t('product_labs_avatar_btn_prepare',locale)}</button>
        </form>
        <div className="demo-surface lab-avatar" aria-live="polite">
          <span className="eyebrow">{preview?t('product_labs_avatar_eyebrow_ready',locale):t('product_labs_avatar_eyebrow_preview',locale)}</span>
          <div className="lab-avatar-portrait" role="img" aria-label={t('product_labs_avatar_aria_portrait',locale)} />
          <h2>{presenter} / {language.toUpperCase()}</h2>
          <p>{preview?script:t('product_labs_avatar_placeholder',locale)}</p>
          <small>{t('product_labs_avatar_note_portrait',locale)}</small>
        </div>
      </section>
      <section className="section">
        <h2>{t('product_labs_avatar_section_title',locale)}</h2>
        <p>{t('product_labs_avatar_section_text',locale)}</p>
      </section>
    </>
  );
}

type Item={id:number;name:string;status:string};

export function SoftwareLab(){
  const locale=useLocale();
  const [view,setView]=useState('crm');
  const [items,setItems]=useState<Item[]>([
    {id:1,name:t('product_labs_software_label_opportunity',locale),status:t('product_labs_software_status_new',locale)},
    {id:2,name:t('product_labs_software_view_booking',locale) + ' per uno studio creativo',status:t('product_labs_software_status_in_progress',locale)}
  ]);
  const [name,setName]=useState('');
  const [booking,setBooking]=useState('');

  return (
    <>
      <PageHero
        kicker={t('product_labs_software_kicker',locale)}
        title={<>{t('product_labs_software_title_demo',locale)}<br/><em>{t('product_labs_software_title_software',locale)}</em></>}
        text={t('product_labs_software_text',locale)}
      />
      <LabStatus kind="SIMULATA" limit={t('product_labs_software_limit',locale)} locale={locale} />
      <section className="section">
        <div className="lab-view-switch" role="group" aria-label={t('product_labs_software_aria_choose',locale)}>
          {[['crm',t('product_labs_software_view_crm',locale)],['booking',t('product_labs_software_view_booking',locale)]].map(([id,label])=>
            <button key={id} className="button" aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>
          )}
        </div>
        {view==='crm'?(
          <div className="demo-surface">
            <form className="lab-inline" onSubmit={e=>{e.preventDefault();if(!name.trim())return;setItems(old=>[...old,{id:Math.max(0,...old.map(i=>i.id))+1,name:name.trim(),status:t('product_labs_software_status_new',locale)}]);setName('')}}>
              <label>{t('product_labs_software_label_opportunity',locale)}<input value={name} maxLength={120} required onChange={e=>setName(e.target.value)}/></label>
              <button className="button">{t('product_labs_software_btn_add',locale)}</button>
            </form>
            <div className="lab-crm">
              {[t('product_labs_software_status_new',locale),t('product_labs_software_status_in_progress',locale),t('product_labs_software_status_done',locale)].map(status=>
                <section key={status}>
                  <h2>{status} <small>{items.filter(i=>i.status===status).length}</small></h2>
                  {items.filter(i=>i.status===status).map(item=>
                    <article key={item.id}>
                      <strong>{item.name}</strong>
                      <label className="sr-only" htmlFor={'lab-status-'+item.id}>{t('product_labs_software_sr_status',locale,{name:item.name})}</label>
                      <select id={'lab-status-'+item.id} value={item.status} onChange={e=>setItems(old=>old.map(i=>i.id===item.id?{...i,status:e.target.value}:i))}>
                        {[t('product_labs_software_status_new',locale),t('product_labs_software_status_in_progress',locale),t('product_labs_software_status_done',locale)].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </article>
                  )}
                </section>
              )}
            </div>
            <p className="demo-note">{t('product_labs_software_note_crm',locale)}</p>
          </div>
        ):(
          <div className="demo-surface">
            <form className="lab-inline" onSubmit={e=>{e.preventDefault();const data=new FormData(e.currentTarget);setBooking(String(data.get('day'))+' · '+String(data.get('time')))}}>
              <label>{t('product_labs_software_label_day',locale)}<input name="day" type="date" required/></label>
              <label>{t('product_labs_software_label_time',locale)}
                <select name="time">
                  <option>09:00</option>
                  <option>11:00</option>
                  <option>15:00</option>
                  <option>17:00</option>
                </select>
              </label>
              <button className="button">{t('product_labs_software_btn_book',locale)}</button>
            </form>
            <p role="status">{booking?t('product_labs_software_booking_confirmed',locale,{booking}):t('product_labs_software_booking_prompt',locale)}</p>
          </div>
        )}
      </section>
    </>
  );
}