import { describe, it, expect } from 'vitest';
import { handleAbout } from '../../src/tools/about.js';

describe('about', () => {
  it('returns server name and version', () => {
    const result = handleAbout();
    expect(result.name).toBe('Switzerland Veterinary Medicines MCP');
    expect(result.version).toBe('0.1.0');
  });

  it('lists CH as supported jurisdiction', () => {
    const result = handleAbout();
    expect(result.jurisdiction).toContain('CH');
  });

  it('reports correct tool count', () => {
    const result = handleAbout();
    expect(result.tools_count).toBe(10);
  });

  it('lists data sources', () => {
    const result = handleAbout();
    expect(result.data_sources.length).toBeGreaterThanOrEqual(5);
    expect(result.data_sources).toContain('Tierarzneimittel-Kompendium (Swissmedic)');
    expect(result.data_sources).toContain('IS ABV — Informationssystem Antibiotika in der Veterinaermedizin');
  });

  it('includes _meta with disclaimer', () => {
    const result = handleAbout();
    expect(result._meta).toBeDefined();
    expect(result._meta.disclaimer).toBeDefined();
    expect(result._meta.disclaimer.length).toBeGreaterThan(50);
    expect(result._meta.server).toBe('ch-vet-medicines-mcp');
  });

  it('includes links', () => {
    const result = handleAbout();
    expect(result.links.homepage).toContain('ansvar.eu');
    expect(result.links.repository).toContain('github.com');
    expect(result.links.mcp_network).toContain('ansvar.ai/mcp');
  });
});
