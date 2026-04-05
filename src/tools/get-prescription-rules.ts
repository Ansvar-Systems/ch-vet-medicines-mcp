import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface PrescriptionRulesArgs {
  medicine_category?: string;
  jurisdiction?: string;
}

export function handleGetPrescriptionRules(db: Database, args: PrescriptionRulesArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = `SELECT category, description, requirements FROM prescription_rules WHERE jurisdiction = ?`;
  const params: unknown[] = [jv.jurisdiction];

  if (args.medicine_category) {
    sql += ` AND LOWER(category) LIKE ?`;
    params.push(`%${args.medicine_category.toLowerCase()}%`);
  }

  sql += ` ORDER BY category`;

  const rows = db.all<{
    category: string; description: string; requirements: string;
  }>(sql, params);

  return {
    filter: args.medicine_category ?? 'alle',
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    rules: rows.map(r => ({
      category: r.category,
      description: r.description,
      requirements: r.requirements,
    })),
    _meta: buildMeta(),
  };
}
