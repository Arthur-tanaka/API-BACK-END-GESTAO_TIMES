import { api, session } from './api.js';
import './styles.css';

const root = document.querySelector('#app');
const state = { user: null, teams: [], tasks: [], page: 'overview', busy: false, notice: '', dialog: null, members: [] };
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const dateLabel = (date) => date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`)) : 'Sem prazo';
const statusLabels = { a_fazer: 'A fazer', desenvolvimento: 'Em andamento', completo: 'Concluída', Analisar: 'Em revisão' };

function notify(message, type = 'success') {
  state.notice = message;
  state.noticeType = type;
  render();
  window.setTimeout(() => { state.notice = ''; render(); }, 3500);
}

async function loadData() {
  state.busy = true;
  render();
  try {
    const [user, teams, tasks] = await Promise.all([api.me(), api.teams(), api.tasks()]);
    state.user = user;
    state.teams = teams;
    state.tasks = tasks;
  } catch (error) {
    if (!session.access) { state.user = null; }
    else notify(error.message, 'error');
  } finally {
    state.busy = false;
    render();
  }
}

function authView(mode = 'login') {
  const registering = mode === 'register';
  root.innerHTML = `<main class="auth-shell"><section class="auth-aside"><div class="brand brand-light"><span class="brand-mark">o</span> orbit</div><div class="auth-message"><span class="eyebrow">TRABALHO EM EQUIPE, COM CLAREZA</span><h1>Todo mundo na mesma direção.</h1><p>Organize projetos, distribua tarefas e acompanhe o que está avançando.</p><div class="auth-art"><span>✓</span><span>↗</span><span>✳</span><i></i></div></div><small>Simples para começar. Feito para avançar.</small></section><section class="auth-content"><form class="auth-card" id="auth-form"><span class="eyebrow">${registering ? 'CRIE SUA CONTA' : 'BEM-VINDO DE VOLTA'}</span><h2>${registering ? 'Vamos começar' : 'Entre na sua conta'}</h2><p class="muted">${registering ? 'Crie seu acesso para organizar seu time.' : 'Acesse seu espaço de trabalho.'}</p>${registering ? '<label>Nome de usuário<input name="username" autocomplete="username" required minlength="3" placeholder="seu.usuario"></label><label>E-mail<input name="email" type="email" autocomplete="email" required placeholder="voce@empresa.com"></label>' : '<label>Nome de usuário<input name="username" autocomplete="username" required placeholder="seu.usuario"></label>'}<label>Senha<input name="password" type="password" autocomplete="${registering ? 'new-password' : 'current-password'}" required minlength="8" placeholder="Pelo menos 8 caracteres"></label><button class="button primary full" type="submit">${registering ? 'Criar conta' : 'Entrar'} <span>→</span></button><div class="form-error" id="form-error"></div><p class="auth-switch">${registering ? 'Já tem uma conta?' : 'Ainda não tem acesso?'} <button type="button" class="text-button" data-auth-mode="${registering ? 'login' : 'register'}">${registering ? 'Entrar' : 'Criar conta'}</button></p></form></section></main>`;
  root.querySelector('[data-auth-mode]').addEventListener('click', (event) => authView(event.currentTarget.dataset.authMode));
  root.querySelector('#auth-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const error = root.querySelector('#form-error');
    const submit = event.currentTarget.querySelector('button[type="submit"]');
    submit.disabled = true;
    submit.innerHTML = '<span class="spinner"></span> Aguarde…';
    try {
      if (registering) {
        await api.register(data);
        const tokens = await api.login({ username: data.username, password: data.password });
        session.save(tokens);
      } else {
        session.save(await api.login(data));
      }
      await loadData();
    } catch (requestError) {
      error.textContent = requestError.message;
      submit.disabled = false;
      submit.textContent = registering ? 'Criar conta' : 'Entrar';
    }
  });
}

function shell() {
  const activeTasks = state.tasks.filter((task) => task.status !== 'completo');
  const content = state.busy ? '<div class="loading"><span class="spinner"></span> Carregando seu espaço…</div>' : pageContent();
  root.innerHTML = `<div class="app-shell"><aside class="sidebar"><a class="brand" href="#"><span class="brand-mark">o</span> orbit</a><div class="workspace-label">ESPAÇO DE TRABALHO</div><nav class="nav-list"><button data-page="overview" class="nav-item ${state.page === 'overview' ? 'active' : ''}"><span class="nav-icon">⌂</span> Visão geral</button><button data-page="teams" class="nav-item ${state.page === 'teams' ? 'active' : ''}"><span class="nav-icon">◇</span> Meus times <span class="nav-count">${state.teams.length}</span></button><button data-page="tasks" class="nav-item ${state.page === 'tasks' ? 'active' : ''}"><span class="nav-icon">▤</span> Tarefas <span class="nav-count">${activeTasks.length}</span></button></nav><div class="sidebar-bottom"><div class="help-card"><div class="help-icon">✳</div><strong>Um passo de cada vez</strong><p>Pequenas entregas levam a grandes resultados.</p></div><div class="profile"><span class="avatar">${escapeHtml((state.user?.username || 'U')[0].toUpperCase())}</span><span class="profile-info"><strong>${escapeHtml(state.user?.username)}</strong><small>${escapeHtml(state.user?.email)}</small></span><button class="icon-button logout" title="Sair" aria-label="Sair">↪</button></div></div></aside><main class="main-panel"><header class="topbar"><div class="breadcrumb">Espaço de trabalho <span>/</span> <strong>${state.page === 'overview' ? 'Visão geral' : state.page === 'teams' ? 'Meus times' : 'Tarefas'}</strong></div><div class="top-actions"><span class="today">${new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span><span class="avatar avatar-small">${escapeHtml((state.user?.username || 'U')[0].toUpperCase())}</span></div></header><section class="page-wrap">${content}</section></main></div>${state.notice ? `<div class="toast ${state.noticeType === 'error' ? 'toast-error' : ''}">${escapeHtml(state.notice)}</div>` : ''}${state.dialog ? dialogMarkup() : ''}`;
  root.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => { state.page = button.dataset.page; render(); }));
  root.querySelector('.logout').addEventListener('click', () => { session.clear(); state.user = null; state.tasks = []; state.teams = []; authView(); });
  root.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => handleAction(button.dataset.action, button.dataset.id)));
  root.querySelectorAll('[data-edit-task]').forEach((button) => button.addEventListener('click', () => openTaskDialog(state.tasks.find((task) => String(task.id) === button.dataset.editTask))));
  root.querySelectorAll('[data-edit-team]').forEach((button) => button.addEventListener('click', () => openMemberDialog(button.dataset.editTeam)));
  root.querySelectorAll('[data-delete-task]').forEach((button) => button.addEventListener('click', () => removeTask(button.dataset.deleteTask)));
  root.querySelectorAll('[data-delete-team]').forEach((button) => button.addEventListener('click', () => removeTeam(button.dataset.deleteTeam)));
  root.querySelectorAll('[data-status]').forEach((select) => select.addEventListener('change', () => updateTaskStatus(select.dataset.status, select.value)));
  root.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', closeDialog));
  root.querySelector('#team-create')?.addEventListener('submit', createTeam);
  root.querySelector('#task-create-open')?.addEventListener('click', () => openTaskDialog());
  root.querySelectorAll('#team-create-open').forEach((button) => button.addEventListener('click', () => { state.dialog = 'team'; render(); bindDialog(); }));
  bindDialog();
}

function pageContent() {
  if (state.page === 'teams') return teamsPage();
  if (state.page === 'tasks') return tasksPage();
  return overviewPage();
}

function pageHeading(kicker, title, description, action = '') {
  return `<div class="page-heading"><div><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

function overviewPage() {
  const done = state.tasks.filter((task) => task.status === 'completo').length;
  const progress = state.tasks.length ? Math.round(done / state.tasks.length * 100) : 0;
  return `${pageHeading('SEU RESUMO', `Olá, ${escapeHtml(state.user?.username)} <span class="wave">✳</span>`, 'Aqui está o que está acontecendo no seu espaço de trabalho.', '<button class="button primary" data-action="new-task">＋ Nova tarefa</button>')}<div class="stats-grid"><article class="stat-card"><div class="stat-top"><span>Times ativos</span><span class="stat-icon violet">◇</span></div><strong>${state.teams.length}</strong><small>times no seu espaço</small></article><article class="stat-card"><div class="stat-top"><span>Tarefas em aberto</span><span class="stat-icon blue">▤</span></div><strong>${state.tasks.length - done}</strong><small>precisam de atenção</small></article><article class="stat-card"><div class="stat-top"><span>Concluídas</span><span class="stat-icon green">✓</span></div><strong>${done}</strong><small>de ${state.tasks.length} tarefas</small></article><article class="stat-card progress-stat"><div class="stat-top"><span>Progresso geral</span><span>${progress}%</span></div><div class="progress-track"><i style="width:${progress}%"></i></div><small>Continue assim, o time está avançando.</small></article></div><div class="section-grid"><section class="panel"><div class="panel-heading"><div><h2>Próximas tarefas</h2><p>O que merece atenção agora</p></div><button class="text-button" data-page="tasks">Ver todas →</button></div>${taskRows(state.tasks.filter((task) => task.status !== 'completo').slice(0, 5))}</section><section class="panel team-panel"><div class="panel-heading"><div><h2>Seus times</h2><p>Espaços de colaboração</p></div><button class="icon-button" id="team-create-open" aria-label="Criar time">＋</button></div>${teamCards(state.teams.slice(0, 4))}</section></div>`;
}

function teamsPage() {
  return `${pageHeading('COLABORAÇÃO', 'Meus times', 'Organize pessoas e entregas em espaços de trabalho.', '<button class="button primary" id="team-create-open">＋ Criar time</button>')}<div class="team-grid">${teamCards(state.teams, true)}</div>`;
}

function teamCards(teams, full = false) {
  if (!teams.length) return '<div class="empty-state"><div class="empty-icon">◇</div><strong>Seu primeiro time começa aqui</strong><p>Crie um time para reunir pessoas e tarefas.</p><button class="button secondary" id="team-create-open">Criar um time</button></div>';
  return `<div class="${full ? 'team-card-grid' : 'team-list'}">${teams.map((team, index) => {
    const teamTasks = state.tasks.filter((task) => task.time === team.id);
    const completed = teamTasks.filter((task) => task.status === 'completo').length;
    return `<article class="team-card"><div class="team-card-top"><span class="team-symbol symbol-${index % 4}">${['◇', '✳', '△', '◈'][index % 4]}</span><span class="role-pill ${team.meu_papel === 'GR' ? 'manager' : ''}">${team.meu_papel === 'GR' ? 'Gerente' : 'Membro'}</span></div><h3>${escapeHtml(team.descricao)}</h3><p>${teamTasks.length} ${teamTasks.length === 1 ? 'tarefa' : 'tarefas'} · ${completed} concluídas</p><div class="team-card-bottom"><span class="mini-avatars"><i>${escapeHtml((state.user?.username || 'U')[0].toUpperCase())}</i></span><span>${team.meu_papel === 'GR' ? `<button class="text-button" data-edit-team="${team.id}">Gerenciar membros</button>` : 'Seu espaço de trabalho'}</span></div>${team.meu_papel === 'GR' ? `<button class="icon-button team-delete" data-delete-team="${team.id}" title="Excluir time">×</button>` : ''}</article>`;
  }).join('')}</div>`;
}

function tasksPage() {
  const taskCount = state.tasks.length;
  return `${pageHeading('ACOMPANHAMENTO', 'Tarefas', `${taskCount} ${taskCount === 1 ? 'entrega cadastrada' : 'entregas cadastradas'} nos seus times.`, '<button class="button primary" id="task-create-open">＋ Nova tarefa</button>')}<section class="panel task-board"><div class="table-wrap"><table><thead><tr><th>ENTREGA</th><th>TIME</th><th>RESPONSÁVEL</th><th>PRAZO</th><th>STATUS</th><th></th></tr></thead><tbody>${state.tasks.length ? state.tasks.map(taskRow).join('') : '<tr><td colspan="6"><div class="empty-state compact"><div class="empty-icon">▤</div><strong>Nenhuma tarefa por enquanto</strong><p>Crie sua primeira tarefa para acompanhar o progresso.</p></div></td></tr>'}</tbody></table></div></section>`;
}

function taskRows(tasks) {
  if (!tasks.length) return '<div class="empty-state compact"><div class="empty-icon">✓</div><strong>Tudo em dia</strong><p>Não há tarefas em aberto.</p></div>';
  return `<div class="task-list">${tasks.map((task) => `<div class="task-row"><span class="task-check ${task.status === 'completo' ? 'checked' : ''}">${task.status === 'completo' ? '✓' : ''}</span><span class="task-description"><strong>${escapeHtml(task.descricao)}</strong><small>${escapeHtml(task.time_nome || teamName(task.time))}</small></span><span class="task-deadline">${dateLabel(task.prazo)}</span><span class="status-chip status-${task.status}">${escapeHtml(statusLabels[task.status] || task.status)}</span></div>`).join('')}</div>`;
}

function taskRow(task) {
  const team = state.teams.find((entry) => entry.id === task.time);
  return `<tr><td><div class="table-task"><span class="task-square">▤</span><strong>${escapeHtml(task.descricao)}</strong></div></td><td>${escapeHtml(task.time_nome || teamName(task.time))}</td><td><span class="assignee"><i>${escapeHtml((task.responsavel_nome || 'U')[0].toUpperCase())}</i>${escapeHtml(task.responsavel_nome || `Usuário ${task.responsavel}`)}</span></td><td>${dateLabel(task.prazo)}</td><td><select class="status-select status-${task.status}" data-status="${task.id}" ${team?.meu_papel !== 'GR' ? 'disabled' : ''}>${Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${task.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></td><td><div class="row-actions">${team?.meu_papel === 'GR' ? `<button class="icon-button" data-edit-task="${task.id}" aria-label="Editar tarefa">✎</button><button class="icon-button danger" data-delete-task="${task.id}" aria-label="Excluir tarefa">×</button>` : ''}</div></td></tr>`;
}

function teamName(id) { return state.teams.find((team) => team.id === id)?.descricao || `Time ${id}`; }

function dialogMarkup() {
  if (state.dialog === 'team') return `<div class="modal-backdrop" data-close-dialog><section class="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="modal-close" data-close-dialog aria-label="Fechar">×</button><span class="eyebrow">NOVO ESPAÇO</span><h2 id="dialog-title">Criar time</h2><p class="muted">Dê um nome ao espaço de colaboração.</p><form id="team-create"><label>Nome do time<input name="descricao" required maxlength="100" placeholder="Ex.: Produto e design"></label><div class="modal-actions"><button type="button" class="button secondary" data-close-dialog>Cancelar</button><button class="button primary">Criar time</button></div></form></section></div>`;
  if (state.dialog === 'members') return `<div class="modal-backdrop" data-close-dialog><section class="modal" role="dialog" aria-modal="true"><button class="modal-close" data-close-dialog aria-label="Fechar">×</button><span class="eyebrow">TIME</span><h2>Gerenciar membros</h2><p class="muted">Adicione alguém usando o nome de usuário da conta.</p><div class="member-list">${state.members.map((member) => `<div class="member-row"><span class="avatar avatar-small">${escapeHtml(member.username[0].toUpperCase())}</span><strong>${escapeHtml(member.username)}</strong><span class="role-pill ${member.papel === 'GR' ? 'manager' : ''}">${member.papel === 'GR' ? 'Gerente' : 'Membro'}</span></div>`).join('')}</div><form id="member-add"><label>Nome de usuário<input name="username" required placeholder="ex.: maria.silva"></label><div class="modal-actions"><button type="button" class="button secondary" data-close-dialog>Concluir</button><button class="button primary">Adicionar</button></div></form></section></div>`;
  const task = state.dialog === 'edit-task' ? state.editTask : null;
  const choices = state.teams.filter((team) => team.meu_papel === 'GR');
  return `<div class="modal-backdrop" data-close-dialog><section class="modal" role="dialog" aria-modal="true"><button class="modal-close" data-close-dialog aria-label="Fechar">×</button><span class="eyebrow">ENTREGA DO TIME</span><h2>${task ? 'Editar tarefa' : 'Nova tarefa'}</h2><p class="muted">Defina o que precisa ser feito e quem vai cuidar.</p><form id="task-form"><label>Descrição<input name="descricao" required maxlength="300" value="${escapeHtml(task?.descricao || '')}" placeholder="Ex.: Preparar apresentação"></label><div class="field-row"><label>Time<select name="time" required>${choices.map((team) => `<option value="${team.id}" ${Number(task?.time) === team.id ? 'selected' : ''}>${escapeHtml(team.descricao)}</option>`).join('')}</select></label><label>Prazo<input name="prazo" type="date" required value="${task?.prazo || ''}"></label></div><label>Responsável<select name="responsavel" required><option value="">Selecione um time primeiro</option></select></label><label>Status<select name="status">${Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${task?.status === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><div class="form-error" id="dialog-error"></div><div class="modal-actions"><button type="button" class="button secondary" data-close-dialog>Cancelar</button><button class="button primary">${task ? 'Salvar alterações' : 'Criar tarefa'}</button></div></form></section></div>`;
}

async function bindDialog() {
  root.querySelector('#task-form')?.addEventListener('submit', submitTask);
  root.querySelector('#member-add')?.addEventListener('submit', addMember);
  const teamSelect = root.querySelector('#task-form [name="time"]');
  if (teamSelect) {
    const refresh = async () => {
      const members = await api.members(teamSelect.value);
      const select = root.querySelector('#task-form [name="responsavel"]');
      select.innerHTML = members.map((member) => `<option value="${member.id}" ${Number(state.editTask?.responsavel) === member.id ? 'selected' : ''}>${escapeHtml(member.username)}</option>`).join('');
    };
    teamSelect.addEventListener('change', refresh);
    await refresh();
  }
}

function openTaskDialog(task = null) {
  if (!state.teams.some((team) => team.meu_papel === 'GR')) return notify('Você precisa ser gerente de um time para criar tarefas.', 'error');
  state.editTask = task;
  state.dialog = task ? 'edit-task' : 'new-task';
  render();
}

async function openMemberDialog(teamId) {
  state.memberTeamId = teamId;
  try { state.members = await api.members(teamId); state.dialog = 'members'; render(); }
  catch (error) { notify(error.message, 'error'); }
}

async function submitTask(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  data.time = Number(data.time);
  data.responsavel = Number(data.responsavel);
  const task = state.editTask;
  try {
    if (task) await api.updateTask(task.id, data);
    else await api.createTask(data);
    closeDialog(); await loadData(); notify(task ? 'Tarefa atualizada.' : 'Tarefa criada.');
  } catch (error) { root.querySelector('#dialog-error').textContent = error.message; }
}

async function createTeam(event) {
  event.preventDefault();
  const form = event.currentTarget;
  try { await api.createTeam(new FormData(form).get('descricao')); closeDialog(); await loadData(); notify('Time criado.'); }
  catch (error) { const message = document.createElement('p'); message.className = 'form-error'; message.textContent = error.message; form.prepend(message); }
}

async function addMember(event) {
  event.preventDefault();
  const username = new FormData(event.currentTarget).get('username');
  try { await api.addMember(state.memberTeamId, username); state.members = await api.members(state.memberTeamId); render(); notify('Participante adicionado.'); }
  catch (error) { const message = document.createElement('p'); message.className = 'form-error'; message.textContent = error.message; event.currentTarget.prepend(message); }
}

async function updateTaskStatus(id, status) {
  const task = state.tasks.find((item) => String(item.id) === String(id));
  try { await api.updateTask(id, { status }); await loadData(); notify('Status atualizado.'); }
  catch (error) { notify(error.message, 'error'); }
}

async function removeTask(id) {
  if (!window.confirm('Excluir esta tarefa?')) return;
  try { await api.deleteTask(id); await loadData(); notify('Tarefa excluída.'); }
  catch (error) { notify(error.message, 'error'); }
}

async function removeTeam(id) {
  if (!window.confirm('Excluir este time e suas tarefas? Esta ação não pode ser desfeita.')) return;
  try { await api.deleteTeam(id); await loadData(); notify('Time excluído.'); }
  catch (error) { notify(error.message, 'error'); }
}

function closeDialog(event) {
  if (event?.currentTarget.classList.contains('modal-backdrop') && event.target !== event.currentTarget) return;
  state.dialog = null; state.editTask = null; render();
}

function handleAction(action) { if (action === 'new-task') openTaskDialog(); }
function render() {
  if (state.user) { shell(); return; }
  if (state.busy && session.access) {
    root.innerHTML = '<main class="loading-screen"><span class="spinner"></span> Carregando seu espaço…</main>';
    return;
  }
  authView();
}

if (session.access) loadData(); else authView();
