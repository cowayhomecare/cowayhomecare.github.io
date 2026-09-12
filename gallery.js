(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const paths = {
    'heart':'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    'x':'m6 6 12 12M18 6 6 18','search':'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    'chevron-down':'m6 9 6 6 6-6','chevron-left':'m15 5-7 7 7 7','chevron-right':'m9 5 7 7-7 7',
    'arrow-right':'M4 12h16m-6-6 6 6-6 6','arrow-left':'M20 12H4m6-6-6 6 6 6',
    'expand':'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
    'folder-plus':'M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm6 7h6m-3-3v6',
    'images':'M4 5h16v16H4V5Zm2-4h16v16M4 16l5-5 5 5 3-3 3 3M15 8h.01',
    'share':'M12 16V2m-5 5 5-5 5 5M5 10H3v12h18V10h-2',
    'home':'m3 10 9-7 9 7v11h-6v-7H9v7H3V10Z',
    'shopping_bag':'M4 7h16l1 14H3L4 7Zm4 0V5a4 4 0 0 1 8 0v2',
    'sell':'M3 3h8l10 10-8 8L3 11V3Zm4 4h.01',
    'grid_view':'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
    'air':'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h6a3 3 0 1 1-3 3',
    'link':'m10 13 4-4M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 1 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0'
  };
  Object.assign(paths,{
    'bed':'M3 19V7m18 12V7M3 15h18M3 10h18M6 10V5h12v5M3 19v2m18-2v2',
    'chair':'M7 13V5a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v8M4 10v7h16v-7M7 17l-1 4m11-4 1 4M7 13h10',
    'drop':'M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Zm-3 13a3 3 0 0 0 3 3',
    'check':'m5 12 4 4L19 6','pause':'M8 5v14M16 5v14','play':'m8 4 12 8-12 8V4Z'
  });
  paths.arrow_back=paths['arrow-left'];paths.close=paths.x;paths.photo_library=paths.images;paths.apps=paths.grid_view;paths.language=paths.link;paths.support_agent=paths.link;
  function icon(name) {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');
    const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',paths[name]||paths.images);svg.append(p);return svg;
  }
  document.querySelectorAll('[data-icon]').forEach(el=>el.append(icon(el.dataset.icon)));
  $('brandImage').addEventListener('error',()=>{$('brandImage').hidden=true;$('brandFallback').hidden=false;});
  if($('brandImage').complete&&!$('brandImage').naturalWidth){$('brandImage').hidden=true;$('brandFallback').hidden=false;}
  // Reuse the app's navigation, with local SVG icons so an external icon-font outage cannot break it.
  document.querySelectorAll('.material-symbols-rounded').forEach(el=>el.replaceWith(icon(el.textContent.trim())));
  if(!document.getElementById('toolMenuButton')){
    const nav=document.createElement('nav');nav.className='fallback-dock bottom-dock-wrap';nav.setAttribute('aria-label','주요 메뉴');
    for(const [title,file,symbol] of [['홈','main.html','home'],['제품','calc.html','shopping_bag'],['혜택','benefit.html','sell'],['갤러리','gallery.html','images']]){const a=document.createElement('a');a.href=file;a.append(icon(symbol),document.createTextNode(title));nav.append(a);}document.body.append(nav);
  }

  const data=window.COWAY_GALLERY_DATA;
  let photos=Array.isArray(data?.photos)?data.photos.filter(p=>p&&typeof p.id==='string'&&typeof p.src==='string'&&typeof p.thumb==='string'&&/^(img\/gallery\/_(web|thumbs)\/[a-f0-9]+\.webp)$/.test(p.src)&&/^(img\/gallery\/_(web|thumbs)\/[a-f0-9]+\.webp)$/.test(p.thumb)).map(p=>({...p,tags:Array.isArray(p.tags)?p.tags:[]})):[];
  const categories=[['work','작업사진'],['bed','침대·프레임'],['air','청정기'],['healing','힐링'],['water','정수기']];
  const cases=[['all','전체'],['foundation','파운데이션'],['family','패밀리'],['guard','가드'],['frames','프레임별'],['mattress','매트리스 세트']];
  const frameTypes=['전체 프레임','투매트리스','수납프레임','단매트리스','마이프레임'];
  const STORAGE='coway.gallery.saved.v1';
  let saved=new Set();
  try{const values=JSON.parse(localStorage.getItem(STORAGE)||'[]');if(Array.isArray(values))saved=new Set(values.filter(v=>typeof v==='string'));}catch{}
  let state={category:photos.some(p=>p.own)?'work':'bed',case:'all',frame:'',model:'',color:'',query:'',savedOnly:false};
  let current=[],viewerPhotos=[],viewerIndex=0,returnFocus=null,heroIndex=0;
  // Human-reviewed photographs only. File hashes survive renames and folder moves.
  const spotlight=[
    {id:'f8fe3a18f493aad7a9c065a3',position:'50% 65%',headline:['이 의자,','안마의자예요.']},
    {id:'053e1494d697318104abfeac',position:'50% 65%',headline:['거실 한편에,','나만의 쉬는 자리.']},
    {id:'ec9f5fc0343b21bb69f56c71',position:'50% 72%',headline:['하루 끝의 쉼,','우리 집에서.']}
  ];
  let heroPhotos=spotlight.map(s=>{const p=photos.find(p=>p.id===s.id&&p.section==='healing');return p?{...p,...s}:null;}).filter(Boolean);
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let heroPaused=reducedMotion.matches||!!navigator.connection?.saveData,heroVisible=true,heroFocus=false,heroHover=false,heroTimer=null;
  const actualSavedCount=()=>photos.filter(p=>saved.has(p.id)).length;
  const normalize=s=>String(s||'').replace(/\s+/g,'').toLowerCase();
  const matchesCategory=p=>state.savedOnly|| (state.category==='work'?p.own:p.section===state.category);
  const matchesCase=p=>state.category!=='bed'||state.savedOnly||state.case==='all'||({foundation:p.category==='파운데이션',family:p.tags.includes('패밀리'),guard:p.tags.includes('가드'),frames:['투매트리스','수납프레임','단매트리스','마이프레임','프레임'].includes(p.category),mattress:p.category==='매트리스 세트'})[state.case];
  const matchesFrame=p=>!state.frame||p.category===state.frame;
  const base=()=>photos.filter(p=>(!p.referenceOnly||state.savedOnly||(state.category==='bed'&&['guard','family'].includes(state.case)))&&matchesCategory(p)&&matchesCase(p)&&matchesFrame(p)&&(!state.savedOnly||saved.has(p.id)));
  function colorHex(color){const s=normalize(color);if(/화이트|아이보리|white/.test(s))return'#eeece4';if(/블랙|black/.test(s))return'#404549';if(/그레이|gray/.test(s))return'#959a9b';if(/핑크|pink|로즈/.test(s))return'#d6b8b3';if(/블루|blue/.test(s))return'#95b2c2';if(/그린|green|민트/.test(s))return'#b1c4b3';if(/브라운|brown|월넛/.test(s))return'#8e7161';if(/베이지|beige|오크|내추럴/.test(s))return'#d7c8af';if(/레드|red/.test(s))return'#ad6867';return'#d1d9d5';}
  function button(text,cls,active,callback){const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.setAttribute('aria-pressed',String(active));b.addEventListener('click',callback);return b;}
  function reset(keepCategory=true){state={...state,...(!keepCategory?{category:'bed',savedOnly:false}:{}),case:'all',frame:'',model:'',color:'',query:''};$('searchInput').value='';render();}
  function renderTabs(){
    const nav=$('categoryTabs');nav.replaceChildren();
    for(const [id,label] of categories){
      const b=button(label,'category-tab',state.category===id&&!state.savedOnly,()=>{state.category=id;state.savedOnly=false;reset();$('categoryTabs').querySelector('[aria-pressed=true]')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});});
      const pictogram=document.createElement('span');pictogram.className='category-icon';pictogram.append(icon(({work:'images',bed:'bed',air:'air',healing:'chair',water:'drop'})[id]));
      const name=document.createElement('span');name.textContent=id==='bed'?'침대':label;b.replaceChildren(pictogram,name);b.setAttribute('aria-label',label+' 사진');
      b.dataset.category=id;nav.append(b);
    }
    const filter=$('caseFilters');filter.replaceChildren();filter.hidden=state.category!=='bed'||state.savedOnly;
    if(!filter.hidden)for(const [id,label] of cases){const b=button(label,'filter-chip',state.case===id,()=>{state.case=id;state.frame='';state.model='';state.color='';render();});b.dataset.case=id;filter.append(b);}
    const frames=$('frameFilters');frames.replaceChildren();frames.hidden=filter.hidden||state.case!=='frames';
    if(!frames.hidden)for(const type of frameTypes){if(type!=='전체 프레임'&&!photos.some(p=>p.category===type))continue;const value=type==='전체 프레임'?'':type;frames.append(button(type,'filter-chip',state.frame===value,()=>{state.frame=value;state.model='';state.color='';render();}));}
    $('savedCount').textContent=actualSavedCount();$('savedButton').setAttribute('aria-pressed',String(state.savedOnly));
  }
  function selectOptions(select,values,placeholder,value){select.replaceChildren(new Option(placeholder,''));for(const entry of values)select.add(new Option(entry,entry));select.value=value;}
  function renderSelects(){
    $('selectRow').hidden=state.category==='work'&&!state.savedOnly;
    const list=base();
    const models=[...new Set(list.map(p=>p.model))].sort((a,b)=>a.localeCompare(b,'ko',{numeric:true}));
    if(!models.includes(state.model))state.model='';
    selectOptions($('modelSelect'),models,'모든 모델',state.model);
    const colors=[...new Set(list.filter(p=>!state.model||p.model===state.model).map(p=>p.color).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));
    if(!colors.includes(state.color))state.color='';
    selectOptions($('colorSelect'),colors,colors.length?'모든 색상':'색상 구분 없음',state.color);$('colorSelect').disabled=!colors.length;
    $('colorDot').style.background=state.color?colorHex(state.color):'';
    $('modelLabel').textContent=state.model||'모든 모델';$('colorLabel').textContent=state.color||(colors.length?'모든 색상':'구분 없음');
    $('modelPicker').dataset.active=String(!!state.model);$('colorPicker').dataset.active=String(!!state.color);$('colorPicker').disabled=!colors.length;
    $('modelPicker').setAttribute('aria-label','모델 선택: '+(state.model||'모든 모델'));$('colorPicker').setAttribute('aria-label','색상 선택: '+(state.color||'모든 색상'));
  }
  function visiblePhotos(){let list=base().filter(p=>(!state.model||p.model===state.model)&&(!state.color||p.color===state.color)&&(!state.query||normalize([p.model,p.category,p.color,...p.tags].join(' ')).includes(normalize(state.query))));if(state.category==='work')list=list.sort((a,b)=>b.addedAt.localeCompare(a.addedAt));return list;}
  function createCard(photo){
    const card=document.createElement('article');card.className='photo-card';card.dataset.photoId=photo.id;
    const open=document.createElement('button');open.type='button';open.className='photo-open';open.setAttribute('aria-label',`${photo.model}${photo.color?' · '+photo.color:''} 사진 크게 보기`);
    const frame=document.createElement('span');frame.className='photo-frame';const img=document.createElement('img');img.alt=photo.model+(photo.color?' · '+photo.color:'')+' 설치 사진';img.loading='lazy';img.decoding='async';img.width=photo.width;img.height=photo.height;img.addEventListener('load',()=>img.classList.add('loaded'));img.addEventListener('error',()=>{frame.classList.add('has-error');img.hidden=true;});img.src=photo.thumb;frame.append(img);
    const badge=photo.tags.includes('가드')?'가드 설치':photo.tags.includes('패밀리')?'패밀리':photo.own?'작업사진':null;
    if(badge){const label=document.createElement('span');label.className='photo-badge';label.textContent=badge;frame.append(label);}
    const copy=document.createElement('span');copy.className='photo-copy';const name=document.createElement('strong');name.textContent=photo.model;const detail=document.createElement('small');
    if(photo.color){const dot=document.createElement('i');dot.className='tiny-dot';dot.style.background=colorHex(photo.color);detail.append(dot);}detail.append(document.createTextNode(photo.color||(photo.own?'직접 작업한 모습':photo.category)));
    copy.append(name,detail);open.append(frame,copy);open.addEventListener('click',()=>openViewer(photo,current));
    const save=button('','photo-save',saved.has(photo.id),()=>toggleSave(photo));save.dataset.saveId=photo.id;save.setAttribute('aria-label',`${photo.model} ${saved.has(photo.id)?'모아두기 해제':'모아두기'}`);save.append(icon('heart'));
    card.append(open,save);return card;
  }
  function render(){
    renderHero();$('showcase').hidden=!heroPhotos.length||state.savedOnly||state.case!=='all'||!!state.frame||!!state.model||!!state.color||!!state.query;
    renderTabs();renderSelects();current=visiblePhotos();const grid=$('galleryGrid');grid.replaceChildren(...current.map(createCard));
    const label=state.savedOnly?'모아둔 사진':state.category==='work'?'직접 작업한 모습':state.model||({foundation:'파운데이션 설치',family:'패밀리 설치',guard:'가드 설치',frames:state.frame||'프레임 설치',mattress:'매트리스 세트'})[state.case]||categories.find(c=>c[0]===state.category)?.[1]+' 설치 사진';
    $('resultsTitle').firstChild.textContent=label+' ';$('resultCount').textContent=current.length;
    $('resetFilters').hidden=state.case==='all'&&!state.frame&&!state.model&&!state.color&&!state.query&&!state.savedOnly;
    $('emptyState').hidden=!!current.length;
    const noWork=state.category==='work'&&!state.savedOnly&&!photos.some(p=>p.own);
    const noSaved=state.savedOnly&&!current.length;
    $('emptyTitle').textContent=noWork?'작업사진을 기다리고 있어요':noSaved?'자주 보여줄 사진을 모아보세요':'조건에 맞는 사진이 없어요';
    $('emptyText').textContent=noWork?'img/gallery/Work 폴더에 사진을 넣고 자동 반영을 실행해주세요.':noSaved?'사진 오른쪽 위 하트를 누르면 여기에 모여요.':'다른 모델이나 색상을 골라보세요.';
    $('emptyAction').textContent=noWork?'사진 추가 방법':noSaved?'제품 사진 둘러보기':'필터 초기화';
    $('contextNote').hidden=state.case!=='guard'||state.category!=='bed'||state.savedOnly;
    $('contextNote').textContent='가드 설치 모습 참고용이에요. 가드의 호환성과 안전성은 별도로 확인해주세요.';
    if(!data){$('showcase').hidden=true;$('emptyState').hidden=false;$('emptyTitle').textContent='사진 목록을 불러오지 못했어요';$('emptyText').textContent='gallery-data.js 파일이 함께 올라갔는지 확인해주세요.';}
    scheduleHero();
  }
  function renderHero(){
    if(!heroPhotos.length){$('showcase').hidden=true;clearTimeout(heroTimer);return;}
    heroIndex%=heroPhotos.length;const p=heroPhotos[heroIndex],img=$('showcaseImage');
    if(img.getAttribute('src')!==p.src){img.src=p.src;img.style.objectPosition=p.position;}
    img.alt=p.model+' 실제 설치 사진';$('showcaseOpen').setAttribute('aria-label',p.model+' 추천 사진 크게 보기');
    $('showcaseTitle').replaceChildren(document.createTextNode(p.headline[0]),document.createElement('br'),document.createTextNode(p.headline[1]));
    $('showcaseCaption').textContent=p.model.replace(/^안마의자\s*/,'')+(p.color?' · '+p.color:'');
    $('showcaseCounter').textContent=`${heroIndex+1} / ${heroPhotos.length}`;
    $('showcaseNext').disabled=heroPhotos.length<2;$('showcasePause').hidden=heroPhotos.length<2;
    $('showcasePause').replaceChildren(icon(heroPaused?'play':'pause'));
    $('showcasePause').setAttribute('aria-pressed',String(heroPaused));$('showcasePause').setAttribute('aria-label',heroPaused?'대표 사진 자동 넘김 시작':'대표 사진 자동 넘김 멈추기');
  }
  function scheduleHero(){
    clearTimeout(heroTimer);
    if(heroPhotos.length<2||heroPaused||!heroVisible||heroFocus||heroHover||document.hidden||$('showcase').hidden||document.body.classList.contains('gallery-modal-open'))return;
    heroTimer=setTimeout(()=>{heroIndex=(heroIndex+1)%heroPhotos.length;renderHero();scheduleHero();},7000);
  }
  $('showcaseImage').addEventListener('load',()=>{if(!reducedMotion.matches)$('showcaseImage').animate?.([{opacity:.6},{opacity:1}],{duration:320});});
  $('showcaseImage').addEventListener('error',()=>{const failed=heroPhotos[heroIndex]?.id;heroPhotos=heroPhotos.filter(p=>p.id!==failed);heroIndex=0;renderHero();scheduleHero();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{heroVisible=entries[0].isIntersecting&&entries[0].intersectionRatio>.4;scheduleHero();},{threshold:[0,.4,.8]}).observe($('showcase'));
  document.addEventListener('visibilitychange',scheduleHero);
  $('showcase').addEventListener('focusin',()=>{heroFocus=true;scheduleHero();});
  $('showcase').addEventListener('focusout',e=>{if(!$('showcase').contains(e.relatedTarget)){heroFocus=false;scheduleHero();}});
  $('showcase').addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){heroHover=true;scheduleHero();}});
  $('showcase').addEventListener('pointerleave',()=>{heroHover=false;scheduleHero();});
  reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)heroPaused=true;renderHero();scheduleHero();});
  function toast(message){const el=$('galleryToast');($('photoViewer').open?$('photoViewer'):document.body).append(el);el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),2600);}
  function toggleSave(photo){saved.has(photo.id)?saved.delete(photo.id):saved.add(photo.id);let stored=true;try{localStorage.setItem(STORAGE,JSON.stringify([...saved]));}catch{stored=false;}
    $('savedCount').textContent=actualSavedCount();document.querySelectorAll('[data-save-id]').forEach(b=>{if(b.dataset.saveId===photo.id){b.setAttribute('aria-pressed',String(saved.has(photo.id)));b.setAttribute('aria-label',`${photo.model} ${saved.has(photo.id)?'모아두기 해제':'모아두기'}`);}});
    if($('photoViewer').open)$('viewerSave').setAttribute('aria-pressed',String(saved.has(viewerPhotos[viewerIndex]?.id)));
    if(state.savedOnly&&!$('photoViewer').open)render();toast(stored?(saved.has(photo.id)?'이 브라우저에 모아뒀어요':'모아보기에서 뺐어요'):'브라우저 저장이 막혀 있어 이번 화면에서만 유지돼요');
  }

  let scale=1,panX=0,panY=0,pointers=new Map(),gesture=null,lastTap=0,multiTouch=false;
  function transform(){const image=$('viewerImage'),stage=$('viewerStage');const maxX=Math.max(0,(image.clientWidth*scale-stage.clientWidth)/2),maxY=Math.max(0,(image.clientHeight*scale-stage.clientHeight)/2);panX=Math.max(-maxX,Math.min(maxX,panX));panY=Math.max(-maxY,Math.min(maxY,panY));image.style.transform=`translate(${panX}px,${panY}px) scale(${scale})`;stage.classList.toggle('is-zoomed',scale>1.02);$('zoomHint').textContent=scale>1.02?'두 번 톡하면 원래 크기로':'두 번 톡하면 확대 · 좌우로 넘기기';}
  function resetZoom(){scale=1;panX=panY=0;pointers.clear();gesture=null;multiTouch=false;transform();}
  function syncModal(){document.body.classList.toggle('gallery-modal-open',$('photoViewer').open||$('helpDialog').open||$('filterDialog').open);scheduleHero();}
  const historyKey='cowayGalleryPhoto';
  function openViewer(photo,list){viewerPhotos=[...list];viewerIndex=viewerPhotos.findIndex(p=>p.id===photo.id);if(viewerIndex<0){viewerPhotos=[photo];viewerIndex=0;}returnFocus=document.activeElement;updateViewer();$('photoViewer').showModal();try{history.pushState({...history.state,[historyKey]:true},'');}catch{}syncModal();$('viewerClose').focus();}
  function closeViewer(){if(!$('photoViewer').open)return;if(history.state?.[historyKey])history.back();else $('photoViewer').close();}
  window.addEventListener('popstate',()=>{if($('photoViewer').open)$('photoViewer').close();if($('filterDialog').open)$('filterDialog').close();});
  $('photoViewer').addEventListener('cancel',event=>{event.preventDefault();closeViewer();});
  $('photoViewer').addEventListener('close',()=>{syncModal();if(state.savedOnly)render();if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
  function updateViewer(){const p=viewerPhotos[viewerIndex];if(!p)return;resetZoom();$('viewerImage').hidden=false;$('viewerError').hidden=true;$('viewerImage').src=p.src;$('viewerImage').alt=p.model+(p.color?' · '+p.color:'');$('viewerCounter').textContent=`${viewerIndex+1} / ${viewerPhotos.length}`;$('viewerTitle').textContent=p.model;$('viewerCategory').textContent=p.own?'작업사진':p.category;$('viewerColor').textContent=p.color||'';$('viewerColor').hidden=!p.color;$('viewerSave').setAttribute('aria-pressed',String(saved.has(p.id)));$('viewerSave').setAttribute('aria-label',saved.has(p.id)?'모아두기 해제':'사진 모아두기');$('viewerTags').replaceChildren(...p.tags.filter(t=>['패밀리','가드'].includes(t)).map(t=>{const s=document.createElement('span');s.textContent=t==='가드'?'가드 설치 참고용':t;return s;}));$('viewerPrev').disabled=viewerPhotos.length<2;$('viewerNext').disabled=viewerPhotos.length<2;
    if(p.referenceOnly)$('viewerCategory').textContent='설치 참고 · 프레임 모델 미확인';
    for(const index of [viewerIndex-1,viewerIndex+1])if(viewerPhotos[index]){const next=new Image();next.src=viewerPhotos[index].src;}
  }
  function nextPhoto(step){viewerIndex=(viewerIndex+step+viewerPhotos.length)%viewerPhotos.length;updateViewer();}
  $('viewerImage').addEventListener('error',()=>{$('viewerImage').hidden=true;$('viewerError').hidden=false;});
  $('viewerImage').addEventListener('load',transform);
  $('viewerClose').addEventListener('click',closeViewer);$('viewerPrev').addEventListener('click',()=>nextPhoto(-1));$('viewerNext').addEventListener('click',()=>nextPhoto(1));$('viewerSave').addEventListener('click',()=>toggleSave(viewerPhotos[viewerIndex]));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('filterDialog').open){e.preventDefault();closePicker();return;}if(!$('photoViewer').open)return;if(e.key==='ArrowRight'){e.preventDefault();nextPhoto(1);}if(e.key==='ArrowLeft'){e.preventDefault();nextPhoto(-1);}});
  const stage=$('viewerStage');
  stage.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;stage.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1){gesture={x:e.clientX,y:e.clientY,panX,panY,time:Date.now()};multiTouch=false;}if(pointers.size===2){multiTouch=true;const[a,b]=[...pointers.values()];gesture={distance:Math.hypot(a.x-b.x,a.y-b.y),scale};}});
  stage.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&gesture.distance){const[a,b]=[...pointers.values()];scale=Math.min(4,Math.max(1,gesture.scale*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance));transform();}else if(pointers.size===1&&scale>1.02&&'x'in gesture){panX=gesture.panX+e.clientX-gesture.x;panY=gesture.panY+e.clientY-gesture.y;transform();}});
  function endPointer(e,cancel=false){if(!pointers.has(e.pointerId))return;const g=gesture;pointers.delete(e.pointerId);if(!cancel&&!multiTouch&&g&&'x'in g){const dx=e.clientX-g.x,dy=e.clientY-g.y,duration=Date.now()-g.time;if(scale<=1.02&&Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4&&duration<750){nextPhoto(dx<0?1:-1);lastTap=0;}else if(Math.hypot(dx,dy)<10&&duration<350){const now=Date.now();if(now-lastTap<300){scale=scale>1.02?1:2.3;panX=panY=0;transform();lastTap=0;}else lastTap=now;}}
    if(pointers.size===1){const p=[...pointers.values()][0];gesture={x:p.x,y:p.y,panX,panY,time:Date.now()};}else gesture=null;
  }
  stage.addEventListener('pointerup',e=>endPointer(e));stage.addEventListener('pointercancel',e=>endPointer(e,true));
  stage.addEventListener('wheel',e=>{if(!e.ctrlKey)return;e.preventDefault();scale=Math.min(4,Math.max(1,scale-e.deltaY*.01));transform();},{passive:false});

  $('viewerShare').addEventListener('click',async()=>{
    const p=viewerPhotos[viewerIndex];const b=$('viewerShare');if(!p||b.disabled)return;b.disabled=true;
    try{
      const response=await fetch(p.src);if(!response.ok)throw new Error('load');const sourceBlob=await response.blob();
      const bitmap=await createImageBitmap(sourceBlob);const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0);bitmap.close();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.92));if(!blob)throw new Error('encode');
      const file=new File([blob],`${p.model.replace(/[\\/:*?"<>|]/g,'-')}.jpg`,{type:'image/jpeg'});
      if(navigator.canShare?.({files:[file]})&&navigator.share){await navigator.share({files:[file],title:p.model});}
      else{const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('사진 저장을 요청했어요. 저장 후 카톡에 첨부해주세요.');}
    }catch(e){if(e.name!=='AbortError')toast('사진 공유를 완료하지 못했어요. 연결 상태를 확인해주세요.');}finally{b.disabled=false;}
  });
  $('modelSelect').addEventListener('change',e=>{state.model=e.target.value;state.color='';render();});$('colorSelect').addEventListener('change',e=>{state.color=e.target.value;render();});
  let pickerKind='model',pickerFocus=null;
  const sheetHistoryKey='cowayGalleryFilter';
  function renderPicker(){
    const select=$(pickerKind==='model'?'modelSelect':'colorSelect'),query=normalize($('filterSearch').value);
    const options=[...select.options].filter(o=>!query||normalize(o.textContent).includes(query));
    $('filterOptions').replaceChildren(...options.map(o=>{
      const b=button('','picker-option',select.value===o.value,()=>{select.value=o.value;select.dispatchEvent(new Event('change'));closePicker();});b.dataset.value=o.value;
      const name=document.createElement('span');name.className='picker-option-name';
      if(pickerKind==='color'&&o.value){const dot=document.createElement('i');dot.className='picker-option-dot';dot.style.background=colorHex(o.value);name.append(dot);}
      name.append(document.createTextNode(o.textContent));const check=document.createElement('span');check.className='picker-option-check';check.append(icon('check'));b.append(name,check);return b;
    }));$('filterEmpty').hidden=!!options.length;
  }
  function openPicker(kind){
    pickerKind=kind;pickerFocus=document.activeElement;$('filterSearch').value='';
    $('filterTitle').textContent=kind==='model'?'어떤 모델을 볼까요?':'어떤 색상을 볼까요?';$('filterSearch').placeholder=kind==='model'?'모델 이름 검색':'색상 이름 검색';
    renderPicker();$('filterDialog').showModal();$('filterOptions').scrollTop=0;
    try{history.pushState({...history.state,[sheetHistoryKey]:true},'');}catch{}syncModal();$('filterClose').focus({preventScroll:true});
  }
  function closePicker(){if(!$('filterDialog').open)return;if(history.state?.[sheetHistoryKey])history.back();else $('filterDialog').close();}
  $('modelPicker').addEventListener('click',()=>openPicker('model'));$('colorPicker').addEventListener('click',()=>openPicker('color'));
  $('filterSearch').addEventListener('input',renderPicker);$('filterClose').addEventListener('click',closePicker);
  $('filterDialog').addEventListener('cancel',e=>{e.preventDefault();closePicker();});
  $('filterDialog').addEventListener('close',()=>{syncModal();if(pickerFocus?.isConnected)pickerFocus.focus({preventScroll:true});});
  $('filterDialog').addEventListener('click',e=>{if(e.target!==$('filterDialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePicker();});
  $('searchToggle').addEventListener('click',()=>{$('searchBox').hidden=!$('searchBox').hidden;$('searchToggle').setAttribute('aria-expanded',String(!$('searchBox').hidden));if(!$('searchBox').hidden)$('searchInput').focus();});
  $('searchInput').addEventListener('input',e=>{state.query=e.target.value;render();});$('searchClear').addEventListener('click',()=>{state.query='';$('searchInput').value='';render();$('searchInput').focus();});
  $('savedButton').addEventListener('click',()=>{state.savedOnly=!state.savedOnly;reset();});$('resetFilters').addEventListener('click',()=>{state.savedOnly=false;reset();});
  $('emptyAction').addEventListener('click',()=>{if(state.category==='work'&&!photos.some(p=>p.own))openHelp();else if(state.savedOnly)reset(false);else reset();});
  function openHelp(){$('helpDialog').showModal();syncModal();} $('helpButton').addEventListener('click',openHelp);$('helpClose').addEventListener('click',()=>$('helpDialog').close());$('helpDialog').addEventListener('close',syncModal);
  $('helpDialog').addEventListener('click',e=>{if(e.target!==$('helpDialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
  $('showcaseOpen').addEventListener('click',()=>{if(heroPhotos.length)openViewer(heroPhotos[heroIndex],heroPhotos);});
  $('showcaseNext').addEventListener('click',()=>{if(!heroPhotos.length)return;heroPaused=true;heroIndex=(heroIndex+1)%heroPhotos.length;renderHero();scheduleHero();});
  $('showcasePause').addEventListener('click',()=>{heroPaused=!heroPaused;heroFocus=false;heroHover=false;renderHero();scheduleHero();});
  $('showcaseBrowse').addEventListener('click',()=>{state.category='healing';state.savedOnly=false;reset();$('galleryControls').scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'});});
  renderHero();render();
})();
