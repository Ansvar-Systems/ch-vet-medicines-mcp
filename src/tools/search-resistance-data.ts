import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface ResistanceArgs {
  query: string;
  bacterium?: string;
  antibiotic_class?: string;
  species?: string;
  jurisdiction?: string;
  limit?: number;
}

export function handleSearchResistanceData(db: Database, args: ResistanceArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const limit = Math.min(args.limit ?? 20, 50);

  let sql = `SELECT bacterium, antibiotic_class, resistance_pct, trend, species, year, source
             FROM resistance_data WHERE jurisdiction = ?`;
  const params: unknown[] = [jv.jurisdiction];

  if (args.bacterium) {
    sql += ` AND LOWER(bacterium) LIKE ?`;
    params.push(`%${args.bacterium.toLowerCase()}%`);
  }

  if (args.antibiotic_class) {
    sql += ` AND LOWER(antibiotic_class) LIKE ?`;
    params.push(`%${args.antibiotic_class.toLowerCase()}%`);
  }

  if (args.species) {
    sql += ` AND LOWER(species) LIKE ?`;
    params.push(`%${args.species.toLowerCase()}%`);
  }

  // Text search across bacterium and antibiotic_class
  const words = args.query.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 0 && !args.bacterium && !args.antibiotic_class) {
    const conditions = words.map(() =>
      `(LOWER(bacterium) LIKE ? OR LOWER(antibiotic_class) LIKE ? OR LOWER(species) LIKE ?)`
    ).join(' AND ');
    sql += ` AND ${conditions}`;
    words.forEach(w => {
      params.push(`%${w.toLowerCase()}%`, `%${w.toLowerCase()}%`, `%${w.toLowerCase()}%`);
    });
  }

  sql += ` ORDER BY year DESC, bacterium, antibiotic_class LIMIT ?`;
  params.push(limit);

  const rows = db.all<{
    bacterium: string; antibiotic_class: string; resistance_pct: number;
    trend: string; species: string; year: number; source: string;
  }>(sql, params);

  return {
    query: args.query,
    filters: {
      bacterium: args.bacterium ?? null,
      antibiotic_class: args.antibiotic_class ?? null,
      species: args.species ?? null,
    },
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    results: rows.map(r => ({
      bacterium: r.bacterium,
      antibiotic_class: r.antibiotic_class,
      resistance_pct: r.resistance_pct,
      trend: r.trend,
      species: r.species,
      year: r.year,
      source: r.source,
    })),
    note: 'Datenquelle: ARCH-Vet Jahresbericht. Resistenzraten koennen je nach Probenherkunft und Methode variieren.',
    _meta: buildMeta(),
  };
}
