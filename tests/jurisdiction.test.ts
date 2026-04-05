import { describe, it, expect } from 'vitest';
import { validateJurisdiction, SUPPORTED_JURISDICTIONS } from '../src/jurisdiction.js';

describe('validateJurisdiction', () => {
  it('accepts CH (default)', () => {
    const result = validateJurisdiction(undefined);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.jurisdiction).toBe('CH');
    }
  });

  it('accepts CH explicitly', () => {
    const result = validateJurisdiction('CH');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.jurisdiction).toBe('CH');
    }
  });

  it('normalises lowercase to uppercase', () => {
    const result = validateJurisdiction('ch');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.jurisdiction).toBe('CH');
    }
  });

  it('rejects unsupported jurisdictions', () => {
    const result = validateJurisdiction('DE');
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.error).toBe('jurisdiction_not_supported');
      expect(result.error.supported).toEqual(SUPPORTED_JURISDICTIONS);
    }
  });

  it('rejects arbitrary strings', () => {
    const result = validateJurisdiction('INVALID');
    expect(result.valid).toBe(false);
  });
});
