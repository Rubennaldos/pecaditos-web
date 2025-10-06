// src/route.ts
export function getAppPath(): string {
  // BASE_URL = '/pecaditos-web/' en Pages; '/' en local
  const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // sin barra final
  const full = window.location.pathname.replace(/\/$/, ''); // sin barra final
  // Si la URL comienza con /pecaditos-web, recórtalo
  const stripped = full.startsWith(base) ? full.slice(base.length) : full;
  // La ruta de tu app: '' o '/' es home
  return stripped === '' ? '/' : stripped;
}
