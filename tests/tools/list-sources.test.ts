import { describe, it, expect, afterEach } from 'vitest';
import { createTestDatabase } from '../helpers/seed-db.js';
import { handleListSources } from '../../src/tools/list-sources.js';
import type { Database } from '../../src/db.js';

let db: Database;

afterEach(() => {
  if (db) db.close();
});

describe('list_sources', () => {
  it('returns array of sources', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    expect(result.sources).toBeDefined();
    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources.length).toBeGreaterThanOrEqual(5);
  });

  it('includes Swissmedic as a source', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    const swissmedic = result.sources.find(s => s.authority === 'Swissmedic');
    expect(swissmedic).toBeDefined();
    expect(swissmedic!.official_url).toContain('tierarzneimittel.ch');
  });

  it('includes TAMV as a source', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    const tamv = result.sources.find(s => s.name.includes('TAMV'));
    expect(tamv).toBeDefined();
    expect(tamv!.official_url).toContain('fedlex.admin.ch');
  });

  it('includes IS ABV as a source', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    const isabv = result.sources.find(s => s.name.includes('IS ABV'));
    expect(isabv).toBeDefined();
  });

  it('includes ARCH-Vet as a source', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    const archvet = result.sources.find(s => s.name.includes('ARCH-Vet'));
    expect(archvet).toBeDefined();
  });

  it('all sources have required fields', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    for (const source of result.sources) {
      expect(source.name).toBeDefined();
      expect(source.authority).toBeDefined();
      expect(source.official_url).toBeDefined();
      expect(source.retrieval_method).toBeDefined();
      expect(source.update_frequency).toBeDefined();
      expect(source.license).toBeDefined();
      expect(source.coverage).toBeDefined();
    }
  });

  it('includes _meta', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    expect(result._meta).toBeDefined();
    expect(result._meta.server).toBe('ch-vet-medicines-mcp');
  });

  it('includes last_retrieved from db_metadata', () => {
    db = createTestDatabase();
    const result = handleListSources(db);
    const swissmedic = result.sources.find(s => s.authority === 'Swissmedic');
    expect(swissmedic!.last_retrieved).toBe('2026-04-01');
  });
});
