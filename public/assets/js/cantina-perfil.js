document.addEventListener('DOMContentLoaded', async () => {
  Cantina.prepararLogout();
  try {
    const d = await Cantina.api('/api/usuarios/perfil');
    const p = d.perfil;
    document.querySelector('.usuario .foto').innerHTML = p.foto ? `<img class="cmd-avatar" src="${Cantina.escape(p.foto)}" alt="Perfil">` : 'Sem foto';
    document.querySelector('.usuario h1').textContent = p.nome;
    document.querySelector('.usuario p').textContent = p.email;
    const vals = document.querySelectorAll('.dados .linha strong');
    vals[0].textContent = p.nome;
    vals[1].textContent = p.email;
    vals[2].textContent = 'Administrador';
    document.querySelector('.dados').insertAdjacentHTML('beforeend', '<div class="cmd-actions"><button class="cmd-btn" id="editarPerfilAdm">Editar perfil</button><button class="cmd-btn secondary" data-logout>Sair</button></div>');
    Cantina.prepararLogout();
    document.querySelector('#editarPerfilAdm').onclick = () => editar(p);
  } catch (e) {
    Cantina.toast(e.message, 'erro');
  }
});

function editar(p) {
  const m = Cantina.modal(`<h2>Editar perfil</h2><div class="cmd-form"><div><label>Nome</label><input id="n" value="${Cantina.escape(p.nome)}"></div><div><label>E-mail</label><input id="e" value="${Cantina.escape(p.email)}"></div><div class="full"><label>Foto</label><input id="f" type="file" accept="image/*"></div></div><div class="cmd-modal-footer"><button class="cmd-btn secondary" id="c">Cancelar</button><button class="cmd-btn" id="s">Salvar</button></div>`);
  m.querySelector('#c').onclick = () => m.remove();
  m.querySelector('#s').onclick = async () => {
    try {
      const foto = await Cantina.arquivoBase64(m.querySelector('#f'));
      await Cantina.api('/api/usuarios/perfil', {
        method: 'PUT',
        body: { nome: m.querySelector('#n').value, email: m.querySelector('#e').value, foto: foto || p.foto }
      });
      Cantina.toast('Perfil atualizado.');
      setTimeout(() => location.reload(), 300);
    } catch (e) {
      Cantina.toast(e.message, 'erro');
    }
  };
}
