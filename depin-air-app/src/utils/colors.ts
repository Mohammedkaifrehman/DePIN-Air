export const CITY_COLORS: Record<string, string> = {
  Delhi: '#E24B4A',
  Mumbai: '#EF9F27',
  Bengaluru: '#1D9E75',
  Chennai: '#378ADD',
  Hyderabad: '#7F77DD',
};

export function getCityColor(city: string): string {
  return CITY_COLORS[city] || '#8B949E';
}

export function getAqiColor(aqi: number): string {
  if (aqi <= 50) return 'var(--accent-green)';
  if (aqi <= 100) return 'var(--accent-amber)';
  if (aqi <= 150) return 'var(--accent-orange)';
  if (aqi <= 200) return 'var(--accent-red)';
  return 'var(--accent-purple)';
}
