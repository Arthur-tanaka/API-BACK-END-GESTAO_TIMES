const ACCESS_KEY = 'gestao.access';
const REFRESH_KEY = 'gestao.refresh';

export const session = {
  get access() { return sessionStorage.getItem(ACCESS_KEY); },
  get refresh() { return sessionStorage.getItem(REFRESH_KEY); },
  save({ access, refresh }) {
    sessionStorage.setItem(ACCESS_KEY, access);
    sessionStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
  },
};

async function request(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (session.access) headers.set('Authorization', `Bearer ${session.access}`);

  let response = await fetch(path, { ...options, headers });
  if (response.status === 401 && retry && session.refresh && path !== '/users/token/refresh/') {
    const refreshResponse = await fetch('/users/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh }),
    });
    if (refreshResponse.ok) {
      const tokens = await refreshResponse.json();
      sessionStorage.setItem(ACCESS_KEY, tokens.access);
      return request(path, options, false);
    }
    session.clear();
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const detail = payload.detail || Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' · ');
    throw new Error(detail || `Erro ${response.status}. Tente novamente.`);
  }
  if (response.status === 204) return null;
  return response.json();
}

const json = (method, data) => ({ method, body: JSON.stringify(data) });

export const api = {
  request,
  login: (data) => request('/users/token/', json('POST', data), false),
  register: (data) => request('/users/register/', json('POST', data), false),
  me: () => request('/users/me/'),
  teams: () => request('/times/times'),
  createTeam: (descricao) => request('/times/times', json('POST', { descricao })),
  deleteTeam: (id) => request(`/times/times/${id}`, { method: 'DELETE' }),
  members: (id) => request(`/times/times/${id}/participantes`),
  addMember: (id, username) => request(`/times/times/${id}/adicionar_participante`, json('POST', { username })),
  tasks: () => request('/tarefas/tarefas'),
  createTask: (data) => request('/tarefas/tarefas', json('POST', data)),
  updateTask: (id, data) => request(`/tarefas/tarefas/${id}`, json('PATCH', data)),
  deleteTask: (id) => request(`/tarefas/tarefas/${id}`, { method: 'DELETE' }),
};
