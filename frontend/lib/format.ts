export function formatPrice(value: unknown, decimals = 2): string {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  if (!isFinite(n)) return (0).toFixed(decimals);
  return n.toFixed(decimals);
}
