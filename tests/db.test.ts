import { describe, it, expect, afterEach } from 'vitest';
import { createTestDatabase } from './helpers/seed-db.js';
import { ftsSearch, tieredFtsSearch, type Database } from '../src/db.js';

let db: Database;

afterEach(() => {
  if (db) db.close();
});

describe('createDatabase', () => {
  it('creates schema with all required tables', () => {
    db = createTestDatabase();
    const tables = db.all<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
    );
    const names = tables.map(t => t.name);
    expect(names).toContain('medicines');
    expect(names).toContain('withdrawal_times');
    expect(names).toContain('antibiotic_categories');
    expect(names).toContain('resistance_data');
    expect(names).toContain('prescription_rules');
    expect(names).toContain('star_targets');
    expect(names).toContain('db_metadata');
  });

  it('creates FTS5 search_index virtual table', () => {
    db = createTestDatabase();
    const tables = db.all<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name = 'search_index'`
    );
    expect(tables.length).toBe(1);
  });

  it('seeds db_metadata with schema_version and mcp_name', () => {
    db = createTestDatabase();
    const version = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['schema_version']);
    expect(version?.value).toBe('1.0');
    const name = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['mcp_name']);
    expect(name?.value).toBe('Switzerland Veterinary Medicines MCP');
  });
});

describe('ftsSearch', () => {
  it('finds medicines by name', () => {
    db = createTestDatabase();
    const results = ftsSearch(db, 'Clamoxyl');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Clamoxyl RTU');
  });

  it('finds medicines by active substance', () => {
    db = createTestDatabase();
    const results = ftsSearch(db, 'Amoxicillin');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty for nonsense queries', () => {
    db = createTestDatabase();
    const results = ftsSearch(db, 'xyznonexistent12345');
    expect(results.length).toBe(0);
  });

  it('respects limit parameter', () => {
    db = createTestDatabase();
    const results = ftsSearch(db, 'Rind', 1);
    expect(results.length).toBeLessThanOrEqual(1);
  });
});

describe('tieredFtsSearch', () => {
  it('returns tier information', () => {
    db = createTestDatabase();
    const result = tieredFtsSearch(db, 'search_index', ['title', 'body', 'category', 'jurisdiction'], 'Clamoxyl');
    expect(result.tier).toBeDefined();
    expect(['phrase', 'and', 'prefix', 'stemmed', 'or', 'like', 'none']).toContain(result.tier);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it('returns empty tier for empty query', () => {
    db = createTestDatabase();
    const result = tieredFtsSearch(db, 'search_index', ['title', 'body', 'category', 'jurisdiction'], '');
    expect(result.tier).toBe('empty');
    expect(result.results.length).toBe(0);
  });
});
