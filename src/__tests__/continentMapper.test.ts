import { continentFromCountry } from '@/utils/continentMapper';

describe('continentMapper', () => {
  it('maps Japan to Asia', () => {
    expect(continentFromCountry('Japan')).toBe('Asia');
  });

  it('maps United States to North America', () => {
    expect(continentFromCountry('United States')).toBe('North America');
  });

  it('maps France to Europe', () => {
    expect(continentFromCountry('France')).toBe('Europe');
  });

  it('maps Brazil to South America', () => {
    expect(continentFromCountry('Brazil')).toBe('South America');
  });

  it('maps Australia to Oceania', () => {
    expect(continentFromCountry('Australia')).toBe('Oceania');
  });

  it('maps South Africa to Africa', () => {
    expect(continentFromCountry('South Africa')).toBe('Africa');
  });

  it('maps Antarctica', () => {
    expect(continentFromCountry('Antarctica')).toBe('Antarctica');
  });

  it('returns null for unknown country', () => {
    expect(continentFromCountry('Atlantis')).toBeNull();
  });

  it('trims country names', () => {
    expect(continentFromCountry(' Japan ')).toBe('Asia');
  });

  it('maps Taiwan to Asia', () => {
    expect(continentFromCountry('Taiwan')).toBe('Asia');
  });

  it('maps Vietnam and Indonesia to Asia', () => {
    expect(continentFromCountry('Vietnam')).toBe('Asia');
    expect(continentFromCountry('Indonesia')).toBe('Asia');
  });

  it('maps United States of America alias', () => {
    expect(continentFromCountry('United States of America')).toBe('North America');
  });

  it('maps New Zealand to Oceania', () => {
    expect(continentFromCountry('New Zealand')).toBe('Oceania');
  });

  it('maps Mexico to North America', () => {
    expect(continentFromCountry('Mexico')).toBe('North America');
  });
});
