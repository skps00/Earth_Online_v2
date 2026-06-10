const countryToContinent: Record<string, string> = {
  'Japan': 'Asia', 'China': 'Asia',
  'South Korea': 'Asia',
  'Taiwan': 'Asia',
  'Thailand': 'Asia',
  'Singapore': 'Asia',
  'United States': 'North America',
  'Canada': 'North America',
  'United Kingdom': 'Europe',
  'France': 'Europe',
  'Germany': 'Europe',
  'Australia': 'Oceania',
  'Brazil': 'South America',
  'South Africa': 'Africa',
  'Egypt': 'Africa',
};

export function continentFromCountry(country: string): string | null {
  return countryToContinent[country] ?? countryToContinent[country.trim()] ?? null;
}
