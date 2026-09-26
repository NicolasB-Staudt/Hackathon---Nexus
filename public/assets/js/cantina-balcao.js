document.addEventListener('DOMContentLoaded',()=>{
  Cantina.prepararLogout();
  const busca=document.querySelector('.busca');
  busca.oninput=()=>carregar(busca.value);
  carregar('');
  document.querySelector('.vendaDireta button').onclick=vendaDireta;
});

async function carregar(q){
  try{
    const d=await Cantina.api(`/api/pedidos?busca=${encodeURIComponent(q)}`);
    const p=d.pedidos.find(x=>x.status==='PRONTO');
    const box=document.querySelector('.pedido');
    if(!p){box.innerHTML='<div class="cmd-empty">Nenhum pedido pronto para retirada.</div>';return;}
    box.innerHTML=`<div class="aluno"><div class="foto">${p.aluno.charAt(0)}</div><div><h2>${Cantina.escape(p.aluno)}</h2><p>${Cantina.escape(p.turma||'')}</p><p>Código: ${Cantina.escape(p.codigoRetirada||p.idPedido)}</p></div></div><div class="status">${Cantina.escape(p.status)}</div><div class="itens"><div><span>${Cantina.escape(p.itens)}</span><strong>${Cantina.moeda(p.valorTotal)}</strong></div></div><div class="rodapePedido"><strong>Total: ${Cantina.moeda(p.valorTotal)}</strong><button id="entregar">Entregar pedido</button></div>`;
    box.querySelector('#entregar').onclick=async()=>{await Cantina.api(`/api/pedidos/${p.idPedido}/status`,{method:'PATCH',body:{status:'RETIRADO'}});Cantina.toast('Pedido entregue.');carregar(q);};
  }catch(e){Cantina.toast(e.message,'erro')}
}

async function vendaDireta(){
  try{
    const [a,p]=await Promise.all([Cantina.api('/api/usuarios/alunos'),Cantina.api('/api/produtos/disponiveis')]);
    if(!a.alunos.length||!p.produtos.length)return Cantina.toast('Cadastre alunos e produtos com estoque antes de iniciar uma venda.','erro');const m=Cantina.modal(`<h2>Venda direta</h2><div class="cmd-form"><div class="full"><label>Aluno</label><select id="aluno">${a.alunos.map(x=>`<option value="${x.idAluno}">${Cantina.escape(x.nome)} - ${Cantina.escape(x.turma)}</option>`).join('')}</select></div><div><label>Produto</label><select id="produto">${p.produtos.map(x=>`<option value="${x.idProd}">${Cantina.escape(x.nome)} - ${Cantina.moeda(x.preco)}</option>`).join('')}</select></div><div><label>Quantidade</label><input id="qtd" type="number" min="1" value="1"></div></div><div class="cmd-modal-footer"><button class="cmd-btn secondary" id="c">Cancelar</button><button class="cmd-btn" id="s">Finalizar venda</button></div>`);
    m.querySelector('#c').onclick=()=>m.remove();
    m.querySelector('#s').onclick=async()=>{try{const d=await Cantina.api('/api/pedidos',{method:'POST',body:{idAluno:m.querySelector('#aluno').value,tipoVenda:'BALCAO',itens:[{idProd:m.querySelector('#produto').value,quantidade:Number(m.querySelector('#qtd').value)}]}});m.remove();Cantina.toast(`Venda registrada. Pedido #${d.idPedido}`);carregar('');}catch(e){Cantina.toast(e.message,'erro')}};
  }catch(e){Cantina.toast(e.message,'erro')}
}
