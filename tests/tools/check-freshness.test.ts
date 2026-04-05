import { describe, it, expect, afterEach } from 'vitest';
import { createTestDatabase } from '../helpers/seed-db.js';
import { handleCheckFreshness } from '../../src/tools/check-freshness.js';
import type { Database } from '../../src/db.js';

let db: Database;

afterEach(() => {
  if (db) db.close();
});

describe('check_data_freshness', () => {
  it('returns fresh status when recently ingested', () => {
    db = createTestDatabase();
    const result = handleCheckFreshness(db);
    expect(result.status).toBe('fresh');
    expect(result.last_ingest).toBe('2026-04-01');
    expect(result.days_since_ingest).toBeTypeOf('number');
    expect(result.days_since_ingest).toBeLessThanOrEqual(90);
  });

  it('returns schema_version', () => {
    db = createTestDatabase();
    const result = handleCheckFreshness(db);
    expect(result.schema_version).toBe('1.0');
  });

  it('returns build_date', () => {
    db = createTestDatabase();
    const result = handleCheckFreshness(db);
    expect(result.build_date).toBe('2026-04-01');
  });

  it('returns staleness threshold', () => {
    db = createTestDatabase();
    const result = handleCheckFreshness(db);
    expect(result.staleness_threshold_days).toBe(90);
  });

  it('returns refresh command', () => {
    db = createTestDatabase();
    const result = handleCheckFreshness(db);
    expect(result.refresh_command).toContain('ingest.yml');
    expect(result.refresh_command).toContain('ch-vet-medicines-mcp');
  });

  it('includes _meta', () => {
    db = createTestDatabase();
    const result = handleCheckFreshness(db);
    expect(result._meta).toBeDefined();
    expect(result._meta.server).toBe('ch-vet-medicines-mcp');
  });

  it('returns unknown when no ingest date exists', () => {
    db = createTestDatabase();
    db.run(`DELETE FROM db_metadata WHERE key = ?`, ['last_ingest']);
    const result = handleCheckFreshness(db);
    expect(result.status).toBe('unknown');
    expect(result.last_ingest).toBeNull();
    expect(result.days_since_ingest).toBeNull();
  });
});
