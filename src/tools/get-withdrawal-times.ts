import { buildMeta } from '../metadata.js';
import { buildCitation } from '../citation.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface WithdrawalArgs {
  medicine_id?: string;
  species?: string;
  produce_type?: string;
  jurisdiction?: string;
}

export function handleGetWithdrawalTimes(db: Database, args: WithdrawalArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  let sql = `SELECT w.medicine_id, m.name AS medicine_name, m.active_substance,
                    w.species, w.produce_type, w.days, w.notes
             FROM withdrawal_times w
             JOIN medicines m ON w.medicine_id = m.id
             WHERE w.jurisdiction = ?`;
  const params: unknown[] = [jv.jurisdiction];

  if (args.medicine_id) {
    sql += ` AND (w.medicine_id = ? OR LOWER(m.name) LIKE ?)`;
    params.push(args.medicine_id, `%${args.medicine_id.toLowerCase()}%`);
  }

  if (args.species) {
    sql += ` AND LOWER(w.species) LIKE ?`;
    params.push(`%${args.species.toLowerCase()}%`);
  }

  if (args.produce_type) {
    sql += ` AND LOWER(w.produce_type) LIKE ?`;
    params.push(`%${args.produce_type.toLowerCase()}%`);
  }

  sql += ` ORDER BY m.name, w.species, w.produce_type LIMIT 50`;

  const rows = db.all<{
    medicine_id: string; medicine_name: string; active_substance: string;
    species: string; produce_type: string; days: number; notes: string;
  }>(sql, params);

  return {
    filters: {
      medicine_id: args.medicine_id ?? null,
      species: args.species ?? null,
      produce_type: args.produce_type ?? null,
    },
    jurisdiction: jv.jurisdiction,
    results_count: rows.length,
    results: rows.map(r => ({
      medicine_id: r.medicine_id,
      medicine_name: r.medicine_name,
      active_substance: r.active_substance,
      species: r.species,
      produce_type: r.produce_type,
      withdrawal_days: r.days,
      notes: r.notes,
    })),
    note: 'Bei Umwidmung (off-label) gilt die doppelte Absetzfrist gemaess TAMV Art. 5-6. Massgebend ist stets die aktuelle Fachinformation.',
    _meta: buildMeta(),
    _citation: buildCitation(
      'CH Withdrawal Times',
      `Swiss veterinary withdrawal times${args.medicine_id ? ` (${args.medicine_id})` : ''}`,
      'get_withdrawal_times',
      { ...(args.medicine_id ? { medicine_id: args.medicine_id } : {}) },
    ),
  };
}
