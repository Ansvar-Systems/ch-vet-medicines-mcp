import { buildMeta } from '../metadata.js';
import { validateJurisdiction } from '../jurisdiction.js';
import type { Database } from '../db.js';

interface AntibioticCategoriesArgs {
  jurisdiction?: string;
}

export function handleGetAntibioticCategories(db: Database, args: AntibioticCategoriesArgs) {
  const jv = validateJurisdiction(args.jurisdiction);
  if (!jv.valid) return jv.error;

  const rows = db.all<{
    antibiotic_class: string; ampel_color: string; restrictions: string; notes: string;
  }>(
    `SELECT antibiotic_class, ampel_color, restrictions, notes
     FROM antibiotic_categories WHERE jurisdiction = ?
     ORDER BY CASE ampel_color WHEN 'gruen' THEN 1 WHEN 'gelb' THEN 2 WHEN 'rot' THEN 3 ELSE 4 END,
              antibiotic_class`,
    [jv.jurisdiction]
  );

  const grouped = {
    gruen: rows.filter(r => r.ampel_color === 'gruen'),
    gelb: rows.filter(r => r.ampel_color === 'gelb'),
    rot: rows.filter(r => r.ampel_color === 'rot'),
  };

  return {
    jurisdiction: jv.jurisdiction,
    ampelsystem: {
      description: 'Einteilung der Antibiotika nach Kritikalitaet gemaess GST/BLV-Empfehlungen',
      gruen: {
        label: 'Gruen — Empirisch einsetzbar',
        description: 'First-line Antibiotika. Empirischer Einsatz ohne Antibiogramm moeglich.',
        classes: grouped.gruen.map(r => ({
          antibiotic_class: r.antibiotic_class,
          restrictions: r.restrictions,
          notes: r.notes,
        })),
      },
      gelb: {
        label: 'Gelb — Antibiogramm empfohlen',
        description: 'Second-line Antibiotika. Einsatz nur mit Antibiogramm empfohlen (Ausnahmen moeglich).',
        classes: grouped.gelb.map(r => ({
          antibiotic_class: r.antibiotic_class,
          restrictions: r.restrictions,
          notes: r.notes,
        })),
      },
      rot: {
        label: 'Rot — Antibiogramm zwingend',
        description: 'Kritisch wichtige Antibiotika (Highest Priority CIA, WHO). Einsatz nur mit Antibiogramm. Restriktiver Einsatz gemaess StAR.',
        classes: grouped.rot.map(r => ({
          antibiotic_class: r.antibiotic_class,
          restrictions: r.restrictions,
          notes: r.notes,
        })),
      },
    },
    total_classes: rows.length,
    _meta: buildMeta(),
  };
}
