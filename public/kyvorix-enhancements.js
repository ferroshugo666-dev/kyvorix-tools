"use strict";
(() => {
  const RECENT_KEY='kyvorix_recent_tools_v2', FAV_KEY='kyvorix_favorite_tools_v1';
  const safe=(fn,fallback)=>{try{return fn()}catch{return fallback}};
  const toast=(title,detail='')=>{
    let el=document.querySelector('.kyv-toast');
    if(!el){el=document.createElement('div');el.className='kyv-toast';el.setAttribute('role','status');document.body.appendChild(el)}
    el.innerHTML=`${title}${detail?`<small>${detail}</small>`:''}`;
    requestAnimationFrame(()=>el.classList.add('show'));
    clearTimeout(el._timer);el._timer=setTimeout(()=>el.classList.remove('show'),2600);
  };
  window.Kyvorix={toast};
  document.addEventListener('DOMContentLoaded',()=>{
    // Download confirmation, consistent across every tool.
    document.querySelectorAll('a[download], #downloadButton').forEach(a=>a.addEventListener('click',()=>toast('✓ Download started','Your file is being saved by your browser.')));
    // Add file metadata + simple progress to tool pages without touching tool logic.
    const input=document.querySelector('input[type=file]');
    const result=document.getElementById('result');
    if(input && !document.querySelector('.kyv-file-details')){
      const details=document.createElement('div');details.className='kyv-file-details';
      const status=document.createElement('div');status.className='kyv-status';status.hidden=true;
      const progress=document.createElement('div');progress.className='kyv-progress';progress.hidden=true;progress.innerHTML='<i></i>';
      input.parentElement?.insertAdjacentElement('afterend',details);details.insertAdjacentElement('afterend',status);status.insertAdjacentElement('afterend',progress);
      const set=(msg,level='')=>{status.textContent=msg;status.hidden=!msg;status.dataset.level=level};
      input.addEventListener('change',()=>{const f=input.files?.[0]; if(!f)return; details.innerHTML=`Selected: <strong>${f.name}</strong> · ${(f.size/1024/1024>=1?(f.size/1024/1024).toFixed(2)+' MB':(f.size/1024).toFixed(1)+' KB')}`; set('Ready to process locally.'); progress.hidden=true;progress.querySelector('i').style.width='0%'});
      document.querySelectorAll('button').forEach(btn=>{
        if(btn.type==='submit'||/convert|compress|resize|crop|create|optimize/i.test(btn.textContent||'')) btn.addEventListener('click',()=>{if(input.files?.length){set('Processing your file…');progress.hidden=false;progress.querySelector('i').style.width='65%';setTimeout(()=>{if(result?.classList.contains('show')||result?.style.display==='block'){progress.querySelector('i').style.width='100%';set('Processing complete. Your result is ready.')}},900)}});
      });
    }
    // Save recent tools from any tool page.
    const toolName=document.querySelector('h1')?.textContent?.trim();
    if(toolName && location.pathname.includes('/tools/')){
      const href=location.pathname.split('/').pop();
      const recent=safe(()=>JSON.parse(localStorage.getItem(RECENT_KEY)||'[]'),[]).filter(x=>x.href!==href);
      recent.unshift({href,name:toolName});localStorage.setItem(RECENT_KEY,JSON.stringify(recent.slice(0,6)));
    }
    // Favorites on homepage.
    const cards=[...document.querySelectorAll('.tool-card[data-tool]')];
    if(cards.length){
      const favs=safe(()=>JSON.parse(localStorage.getItem(FAV_KEY)||'[]'),[]);
      cards.forEach(card=>{
        if(card.querySelector('.kyv-favorite'))return; const href=card.getAttribute('href');
        const b=document.createElement('button');b.type='button';b.className='kyv-favorite';b.setAttribute('aria-label','Add to favorites');b.textContent='☆';
        const sync=()=>{const on=safe(()=>JSON.parse(localStorage.getItem(FAV_KEY)||'[]'),[]).includes(href);b.classList.toggle('active',on);card.classList.toggle('is-favorite',on);b.textContent=on?'★':'☆';b.setAttribute('aria-label',on?'Remove from favorites':'Add to favorites')};
        sync();b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();let arr=safe(()=>JSON.parse(localStorage.getItem(FAV_KEY)||'[]'),[]);arr=arr.includes(href)?arr.filter(x=>x!==href):[href,...arr].slice(0,8);localStorage.setItem(FAV_KEY,JSON.stringify(arr));sync();toast(arr.includes(href)?'Added to favorites':'Removed from favorites')});card.classList.add('kyv-favorite-card');card.appendChild(b);
      });
    }
  });
})();
