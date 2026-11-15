import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/users': 'http://127.0.0.1:8000',
      '/times': 'http://127.0.0.1:8000',
      '/tarefas': 'http://127.0.0.1:8000',
    },
  },
});
