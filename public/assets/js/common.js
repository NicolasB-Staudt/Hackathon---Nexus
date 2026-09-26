window.Cantina={
  escape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));},
  async api(url,options={}){
    const cfg={credentials:'same-origin',...options};
    cfg.headers={'Content-Type':'application/json',...(options.headers||{})};
    if(cfg.body && typeof cfg.body!=='string') cfg.body=JSON.stringify(cfg.body);
    const r=await fetch(url,cfg); let data={};
    try{data=await r.json();}catch{}
    if(r.status===401 && !url.includes('/auth/login')) location.href='inde.html';
    if(!r.ok) throw new Error(data.mensagem||'Erro na operação.');
    return data;
  },
  moeda(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});},
  dataHora(v){if(!v)return '-';return new Date(v).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});},
  toast(msg,tipo='ok'){
    document.querySelector('.cmd-toast')?.remove();
    const d=document.createElement('div');d.className=`cmd-toast ${tipo}`;d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),3200);
  },
  async arquivoBase64(input){const f=input.files?.[0];if(!f)return null;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type))throw new Error('Selecione uma imagem PNG, JPEG, WebP ou GIF.');if(f.size>4*1024*1024)throw new Error('A imagem deve ter no máximo 4 MB.');return await new Promise((ok,err)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=err;r.readAsDataURL(f);});},
  modal(html){const bg=document.createElement('div');bg.className='cmd-modal-bg';bg.innerHTML=`<div class="cmd-modal">${html}</div>`;bg.addEventListener('click',e=>{if(e.target===bg)bg.remove();});document.body.appendChild(bg);return bg;},
  async me(redirecionar=true){try{return (await this.api('/api/auth/me')).usuario;}catch(e){if(redirecionar)location.href='inde.html';throw e;}},
  prepararLogout(){document.querySelectorAll('[data-logout]').forEach(a=>a.addEventListener('click',async e=>{e.preventDefault();try{await this.api('/api/auth/logout',{method:'POST'});}catch{}localStorage.removeItem('cantina_carrinho');localStorage.removeItem('cantina_aluno_resp');location.href='inde.html';}));}
};

document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('.topo nav a').forEach(a=>{if(a.getAttribute('href')===location.pathname.split('/').pop())a.setAttribute('aria-current','page');});});
