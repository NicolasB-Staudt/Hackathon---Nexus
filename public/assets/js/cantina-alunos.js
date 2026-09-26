let alunos = [];

document.addEventListener('DOMContentLoaded', () => {
  Cantina.prepararLogout();
  document.querySelector('#novoAluno').onclick = () => form();
  carregar();
});

async function carregar() {
  try {
    alunos = (await Cantina.api('/api/usuarios/alunos')).alunos;
    const t = document.querySelector('#listaAlunos');
    t.innerHTML = alunos.length
      ? alunos.map(a => `<div class="linha"><span>${Cantina.escape(a.nome)}</span><span>${Cantina.escape(a.turma)}</span><span>${Cantina.escape(a.email)}</span><span>${Cantina.moeda(a.saldo)}</span><div class="cmd-actions"><button class="cmd-btn" data-e="${a.idAluno}">Editar</button><button class="cmd-btn danger" data-d="${a.idAluno}">Excluir</button></div></div>`).join('')
      : '<div class="cmd-empty">Nenhum aluno cadastrado.</div>';

    t.querySelectorAll('[data-e]').forEach(b => {
      b.onclick = () => form(alunos.find(a => a.idAluno == b.dataset.e));
    });

    t.querySelectorAll('[data-d]').forEach(b => {
      b.onclick = async () => {
        if (!confirm('Excluir este aluno?')) return;
        try {
          await Cantina.api(`/api/usuarios/alunos/${b.dataset.d}`, { method: 'DELETE' });
          Cantina.toast('Aluno excluído.');
          carregar();
        } catch (e) {
          Cantina.toast(e.message, 'erro');
        }
      };
    });
  } catch (e) {
    Cantina.toast(e.message, 'erro');
  }
}

function form(a = {}) {
  const m = Cantina.modal(`<h2>${a.idAluno ? 'Editar aluno' : 'Novo aluno'}</h2><div class="cmd-form"><div><label>Nome</label><input id="n" value="${a.nome || ''}"></div><div><label>Turma</label><input id="t" value="${a.turma || ''}"></div><div><label>E-mail</label><input id="e" value="${a.email || ''}"></div><div><label>Senha ${a.idAluno ? '(deixe em branco para manter)' : ''}</label><input id="s" type="password"></div><div class="full"><label>Foto</label><input id="f" type="file" accept="image/*"></div></div><div class="cmd-modal-footer"><button class="cmd-btn secondary" id="c">Cancelar</button><button class="cmd-btn" id="ok">Salvar</button></div>`);

  m.querySelector('#c').onclick = () => m.remove();
  m.querySelector('#ok').onclick = async () => {
    try {
      const foto = await Cantina.arquivoBase64(m.querySelector('#f'));
      const body = {
        nome: m.querySelector('#n').value,
        turma: m.querySelector('#t').value,
        email: m.querySelector('#e').value,
        senha: m.querySelector('#s').value,
        foto: foto || a.foto || null
      };
      await Cantina.api(a.idAluno ? `/api/usuarios/alunos/${a.idAluno}` : '/api/usuarios/alunos', {
        method: a.idAluno ? 'PUT' : 'POST',
        body
      });
      m.remove();
      Cantina.toast('Aluno salvo.');
      carregar();
    } catch (e) {
      Cantina.toast(e.message, 'erro');
    }
  };
}
