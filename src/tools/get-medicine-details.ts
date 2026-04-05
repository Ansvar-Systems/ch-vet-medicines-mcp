import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface MedicineDetailsArgs {
  medicine_id: string;
  jurisdiction?: string;
}

export function handleGetMedicineDetails(db: Database, args: MedicineDetailsArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const medicine = db.get<{
    id: string; name: string; active_substance: string; species: string;
    administration_route: string; swissmedic_number: string; category: string;
  }>(
    `SELECT id, name, active_substance, species, administration_route, swissmedic_number, category
     FROM medicines WHERE id = ? AND jurisdiction = ?`,
    [args.medicine_id, jv.jurisdiction]
  );

  if (!medicine) {
    // Try partial match on name
    const byName = db.get<{
      id: string; name: string; active_substance: string; species: string;
      administration_route: string; swissmedic_number: string; category: string;
    }>(
      `SELECT id, name, active_substance, species, administration_route, swissmedic_number, category
       FROM medicines WHERE LOWER(name) LIKE ? AND jurisdiction = ?`,
      [`%${args.medicine_id.toLowerCase()}%`, jv.jurisdiction]
    );

    if (!byName) {
      return {
        error: 'medicine_not_found',
        medicine_id: args.medicine_id,
        message: `Kein Tierarzneimittel mit ID '${args.medicine_id}' gefunden. Verwenden Sie search_medicines fuer die Suche.`,
      };
    }

    return buildResult(db, byName, jv.jurisdiction);
  }

  return buildResult(db, medicine, jv.jurisdiction);
}

function buildResult(
  db: Database,
  medicine: {
    id: string; name: string; active_substance: string; species: string;
    administration_route: string; swissmedic_number: string; category: string;
  },
  jurisdiction: string,
) {
  const withdrawals = db.all<{
    species: string; produce_type: string; days: number; notes: string;
  }>(
    `SELECT species, produce_type, days, notes FROM withdrawal_times
     WHERE medicine_id = ? AND jurisdiction = ?`,
    [medicine.id, jurisdiction]
  );

  return {
    medicine_id: medicine.id,
    name: medicine.name,
    active_substance: medicine.active_substance,
    species: medicine.species.split(',').map(s => s.trim()),
    administration_route: medicine.administration_route,
    swissmedic_number: medicine.swissmedic_number,
    category: medicine.category,
    withdrawal_times: withdrawals.map(w => ({
      species: w.species,
      produce_type: w.produce_type,
      days: w.days,
      notes: w.notes,
    })),
    jurisdiction,
    _meta: buildMeta(),
  };
}
