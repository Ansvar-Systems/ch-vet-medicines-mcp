import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import { ftsSearch, type Database } from '../db.js';

interface SearchArgs {
  query: string;
  species?: string;
  jurisdiction?: string;
  limit?: number;
}

export function handleSearchMedicines(db: Database, args: SearchArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const limit = Math.min(args.limit ?? 20, 50);

  // Try FTS first
  let ftsResults = ftsSearch(db, args.query, limit);

  if (args.species) {
    ftsResults = ftsResults.filter(r =>
      r.body.toLowerCase().includes(args.species!.toLowerCase()) ||
      r.category.toLowerCase().includes(args.species!.toLowerCase())
    );
  }

  if (ftsResults.length > 0) {
    return {
      query: args.query,
      jurisdiction: jv.jurisdiction,
      results_count: ftsResults.length,
      results: ftsResults.map(r => ({
        title: r.title,
        body: r.body,
        category: r.category,
        relevance_rank: r.rank,
      })),
      _meta: buildMeta(),
    };
  }

  // Direct DB search fallback
  let sql = `SELECT id, name, active_substance, species, administration_route, swissmedic_number, category
             FROM medicines WHERE jurisdiction = ?`;
  const params: unknown[] = [jv.jurisdiction];

  if (args.species) {
    sql += ` AND LOWER(species) LIKE ?`;
    params.push(`%${args.species.toLowerCase()}%`);
  }

  // Search across name and active_substance
  const words = args.query.split(/\s+/).filter(w => w.length > 1);
  if (words.length > 0) {
    const conditions = words.map(() =>
      `(LOWER(name) LIKE ? OR LOWER(active_substance) LIKE ?)`
    ).join(' AND ');
    sql += ` AND ${conditions}`;
    words.forEach(w => {
      params.push(`%${w.toLowerCase()}%`, `%${w.toLowerCase()}%`);
    });
  }

  sql += ` LIMIT ?`;
  params.push(limit);

  const rows = db.all<{
    id: string; name: string; active_substance: string; species: string;
    administration_route: string; swissmedic_number: string; category: string;
  }>(sql, params);

  return {
    query: args.query,
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    results: rows.map(r => ({
      medicine_id: r.id,
      name: r.name,
      active_substance: r.active_substance,
      species: r.species,
      administration_route: r.administration_route,
      swissmedic_number: r.swissmedic_number,
      category: r.category,
    })),
    _meta: buildMeta(),
  };
}
