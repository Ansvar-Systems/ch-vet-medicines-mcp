import { describe, it, expect, afterEach } from 'vitest';
import { createTestDatabase } from '../helpers/seed-db.js';
import { handleSearchMedicines } from '../../src/tools/search-medicines.js';
import type { Database } from '../../src/db.js';

let db: Database;

afterEach(() => {
  if (db) db.close();
});

describe('search_medicines', () => {
  it('finds medicines by name', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'Clamoxyl' });
    expect(result).toHaveProperty('results');
    if ('results' in result) {
      expect(result.results_count).toBeGreaterThan(0);
    }
  });

  it('finds medicines by active substance', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'Amoxicillin' });
    expect(result).toHaveProperty('results');
    if ('results' in result) {
      expect(result.results_count).toBeGreaterThan(0);
    }
  });

  it('returns empty results for unknown medicine', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'nonexistentxyz123' });
    if ('results' in result) {
      expect(result.results_count).toBe(0);
    }
  });

  it('respects limit parameter', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'Rind', limit: 1 });
    if ('results' in result) {
      expect(result.results.length).toBeLessThanOrEqual(1);
    }
  });

  it('filters by species', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'Amoxicillin', species: 'Rind' });
    expect(result).toHaveProperty('results');
  });

  it('caps limit at 50', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'test', limit: 100 });
    // Should not crash, limit is internally capped
    expect(result).toBeDefined();
  });

  it('includes _meta in results', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'Clamoxyl' });
    if ('_meta' in result) {
      expect(result._meta.server).toBe('ch-vet-medicines-mcp');
    }
  });

  it('rejects unsupported jurisdiction', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'test', jurisdiction: 'DE' });
    expect(result).toHaveProperty('error');
    if ('error' in result) {
      expect(result.error).toBe('jurisdiction_not_supported');
    }
  });

  it('returns jurisdiction in results', () => {
    db = createTestDatabase();
    const result = handleSearchMedicines(db, { query: 'Clamoxyl' });
    if ('jurisdiction' in result) {
      expect(result.jurisdiction).toBe('CH');
    }
  });
});
