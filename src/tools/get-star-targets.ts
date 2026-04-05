import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface StarTargetsArgs {
  species?: string;
  jurisdiction?: string;
}

export function handleGetStarTargets(db: Database, args: StarTargetsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = `SELECT species, target_description, baseline_year, target_year, reduction_pct, status, notes
             FROM star_targets WHERE jurisdiction = ?`;
  const params: unknown[] = [jv.jurisdiction];

  if (args.species) {
    sql += ` AND (LOWER(species) LIKE ? OR species IS NULL)`;
    params.push(`%${args.species.toLowerCase()}%`);
  }

  sql += ` ORDER BY COALESCE(species, 'ZZZ'), target_year`;

  const rows = db.all<{
    species: string | null; target_description: string; baseline_year: number;
    target_year: number; reduction_pct: number; status: string; notes: string;
  }>(sql, params);

  return {
    filter: args.species ?? 'alle',
    jurisdiction: jv.jurisdiction,
    strategy: 'StAR — Strategie Antibiotikaresistenzen Schweiz',
    results_count: rows.length,
    targets: rows.map(r => ({
      species: r.species ?? 'Alle Tierarten',
      target_description: r.target_description,
      baseline_year: r.baseline_year,
      target_year: r.target_year,
      reduction_pct: r.reduction_pct,
      status: r.status,
      notes: r.notes,
    })),
    _meta: buildMeta(),
  };
}
