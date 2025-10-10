export function normalizeMsisdn(raw?: string): string {
  const n = (raw ?? '').replace(/\D+/g, '');
  if (!n) return '';
  if (n.startsWith('0')) return '62' + n.slice(1); 
  if (n.startsWith('8')) return '62' + n;
  return n;
}

export function buildWaUrl(number?: string, message?: string) {
  const num = normalizeMsisdn(number);
  const txt = encodeURIComponent(message ?? '');
  return `https://wa.me/${num}?text=${txt}`;
}

export function compileMsg(tpl: string, ctx: Record<string, string>) {
  return tpl.replace('{brand}', ctx.brand || '').replace('{site}', window.location.hostname).replace('{page}', window.location.href);
}
