import { createDatabase, type Database } from '../../src/db.js';
import { join } from 'path';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';

/**
 * Create a temporary in-memory-like database seeded with test data.
 * Uses a temp file so better-sqlite3 can use FTS5.
 */
export function createTestDatabase(): Database {
  const dir = mkdtempSync(join(tmpdir(), 'ch-vet-mcp-test-'));
  const db = createDatabase(join(dir, 'test.db'));

  // --- medicines ---
  db.run(
    `INSERT INTO medicines (id, name, active_substance, species, administration_route, swissmedic_number, category, jurisdiction, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['amoxicillin-rind', 'Clamoxyl RTU', 'Amoxicillin', 'Rind, Schwein', 'parenteral', '55001', 'B', 'CH', 'DE'],
  );
  db.run(
    `INSERT INTO medicines (id, name, active_substance, species, administration_route, swissmedic_number, category, jurisdiction, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['enrofloxacin-gefluegel', 'Baytril 10%', 'Enrofloxacin', 'Gefluegel, Rind', 'oral', '55002', 'A', 'CH', 'DE'],
  );
  db.run(
    `INSERT INTO medicines (id, name, active_substance, species, administration_route, swissmedic_number, category, jurisdiction, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['oxytetracyclin-schwein', 'Terramycin LA', 'Oxytetracyclin', 'Schwein, Rind', 'parenteral', '55003', 'B', 'CH', 'DE'],
  );
  db.run(
    `INSERT INTO medicines (id, name, active_substance, species, administration_route, swissmedic_number, category, jurisdiction, language)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['colistin-schwein', 'Colistin vet', 'Colistin', 'Schwein, Gefluegel', 'oral', '55004', 'A', 'CH', 'DE'],
  );

  // --- withdrawal_times ---
  db.run(
    `INSERT INTO withdrawal_times (medicine_id, species, produce_type, days, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['amoxicillin-rind', 'Rind', 'Fleisch', 28, 'Standard-Absetzfrist', 'CH'],
  );
  db.run(
    `INSERT INTO withdrawal_times (medicine_id, species, produce_type, days, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['amoxicillin-rind', 'Rind', 'Milch', 3, null, 'CH'],
  );
  db.run(
    `INSERT INTO withdrawal_times (medicine_id, species, produce_type, days, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['enrofloxacin-gefluegel', 'Gefluegel', 'Fleisch', 7, null, 'CH'],
  );
  db.run(
    `INSERT INTO withdrawal_times (medicine_id, species, produce_type, days, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['enrofloxacin-gefluegel', 'Gefluegel', 'Eier', 0, 'Nicht bei Legehennen anwenden', 'CH'],
  );
  db.run(
    `INSERT INTO withdrawal_times (medicine_id, species, produce_type, days, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['oxytetracyclin-schwein', 'Schwein', 'Fleisch', 21, null, 'CH'],
  );

  // --- antibiotic_categories ---
  db.run(
    `INSERT INTO antibiotic_categories (antibiotic_class, ampel_color, restrictions, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Penicilline', 'gruen', null, 'First-line, empirisch einsetzbar', 'CH'],
  );
  db.run(
    `INSERT INTO antibiotic_categories (antibiotic_class, ampel_color, restrictions, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Tetracycline', 'gruen', null, 'Breitspektrum, gut vertraeglich', 'CH'],
  );
  db.run(
    `INSERT INTO antibiotic_categories (antibiotic_class, ampel_color, restrictions, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Makrolide', 'gelb', 'Antibiogramm empfohlen', 'Second-line', 'CH'],
  );
  db.run(
    `INSERT INTO antibiotic_categories (antibiotic_class, ampel_color, restrictions, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Fluoroquinolone', 'rot', 'Antibiogramm zwingend, nur bei fehlendem Therapieerfolg', 'Critically important (WHO)', 'CH'],
  );
  db.run(
    `INSERT INTO antibiotic_categories (antibiotic_class, ampel_color, restrictions, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?)`,
    ['Polymyxine (Colistin)', 'rot', 'Antibiogramm zwingend, Reserveantibiotikum', 'Last resort bei Gram-negativen Erregern', 'CH'],
  );

  // --- resistance_data ---
  db.run(
    `INSERT INTO resistance_data (bacterium, antibiotic_class, resistance_pct, trend, species, year, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['E. coli', 'Fluoroquinolone', 12.5, 'stable', 'Gefluegel', 2025, 'ARCH-Vet 2025', 'CH'],
  );
  db.run(
    `INSERT INTO resistance_data (bacterium, antibiotic_class, resistance_pct, trend, species, year, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['E. coli', 'Penicilline', 45.2, 'increasing', 'Schwein', 2025, 'ARCH-Vet 2025', 'CH'],
  );
  db.run(
    `INSERT INTO resistance_data (bacterium, antibiotic_class, resistance_pct, trend, species, year, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Campylobacter', 'Fluoroquinolone', 38.7, 'increasing', 'Gefluegel', 2025, 'ARCH-Vet 2025', 'CH'],
  );
  db.run(
    `INSERT INTO resistance_data (bacterium, antibiotic_class, resistance_pct, trend, species, year, source, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['MRSA', 'Penicilline', 100.0, 'stable', 'Schwein', 2025, 'ARCH-Vet 2025', 'CH'],
  );

  // --- prescription_rules ---
  db.run(
    `INSERT INTO prescription_rules (category, description, requirements, jurisdiction)
     VALUES (?, ?, ?, ?)`,
    ['A', 'Einmalige tieraerztliche Verschreibung', 'Nur auf tieraerztliche Verschreibung', 'CH'],
  );
  db.run(
    `INSERT INTO prescription_rules (category, description, requirements, jurisdiction)
     VALUES (?, ?, ?, ?)`,
    ['B', 'Abgabe durch Tierarzt', 'Abgabe nur durch Tierarzt, Wiederholung moeglich', 'CH'],
  );
  db.run(
    `INSERT INTO prescription_rules (category, description, requirements, jurisdiction)
     VALUES (?, ?, ?, ?)`,
    ['D', 'Abgabe ohne Verschreibung', 'Fachberatung empfohlen', 'CH'],
  );
  db.run(
    `INSERT INTO prescription_rules (category, description, requirements, jurisdiction)
     VALUES (?, ?, ?, ?)`,
    ['Selbstdispensation', 'Tieraerztliche Selbstdispensation', 'Nur bei TAM-Vereinbarung mit Betrieb', 'CH'],
  );
  db.run(
    `INSERT INTO prescription_rules (category, description, requirements, jurisdiction)
     VALUES (?, ?, ?, ?)`,
    ['Behandlungsjournal', 'Dokumentationspflicht', 'Alle Antibiotika-Behandlungen muessen im Behandlungsjournal erfasst werden', 'CH'],
  );

  // --- star_targets ---
  db.run(
    `INSERT INTO star_targets (species, target_description, baseline_year, target_year, reduction_pct, status, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Schwein', 'Reduktion Gesamtverbrauch Antibiotika', 2016, 2026, 50.0, 'on_track', 'Deutliche Reduktion seit 2016', 'CH'],
  );
  db.run(
    `INSERT INTO star_targets (species, target_description, baseline_year, target_year, reduction_pct, status, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Gefluegel', 'Reduktion kritisch wichtiger Antibiotika', 2016, 2026, 75.0, 'achieved', 'Ziel bereits 2023 erreicht', 'CH'],
  );
  db.run(
    `INSERT INTO star_targets (species, target_description, baseline_year, target_year, reduction_pct, status, notes, jurisdiction)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [null, 'Reduktion Gesamtverbrauch alle Tierarten', 2016, 2026, 50.0, 'on_track', null, 'CH'],
  );

  // --- FTS index ---
  db.run(
    `INSERT INTO search_index (title, body, category, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Clamoxyl RTU', 'Amoxicillin Rind Schwein parenteral', 'B', 'CH'],
  );
  db.run(
    `INSERT INTO search_index (title, body, category, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Baytril 10%', 'Enrofloxacin Gefluegel Rind oral', 'A', 'CH'],
  );
  db.run(
    `INSERT INTO search_index (title, body, category, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Terramycin LA', 'Oxytetracyclin Schwein Rind parenteral', 'B', 'CH'],
  );
  db.run(
    `INSERT INTO search_index (title, body, category, jurisdiction) VALUES (?, ?, ?, ?)`,
    ['Colistin vet', 'Colistin Schwein Gefluegel oral', 'A', 'CH'],
  );

  // --- db_metadata ---
  db.run(`INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)`, ['last_ingest', '2026-04-01']);
  db.run(`INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)`, ['build_date', '2026-04-01']);

  return db;
}
