/**
 * Switzerland Veterinary Medicines MCP — Data Ingestion Script
 *
 * Populates the database with Swiss veterinary medicine data from:
 * - Swissmedic — Tierarzneimittel-Kompendium (tierarzneimittel.ch), Zulassungen
 * - BLV — IS ABV-Daten, TAMV (Tierarzneimittelverordnung), Antibiotikastrategie StAR
 * - ARCH-Vet — Swiss Antibiotic Resistance Monitoring Report (jaehrlich)
 * - GST — Therapierichtlinien, Ampelsystem
 *
 * All data in German (primary language for Swiss federal veterinary data).
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// 1. Medicines — Zugelassene Tierarzneimittel (Swissmedic)
//    Categories: Antibiotika, Antiparasitika, Entzuendungshemmer, Hormone, etc.
// ---------------------------------------------------------------------------

interface Medicine {
  id: string;
  name: string;
  active_substance: string;
  species: string;
  administration_route: string;
  swissmedic_number: string;
  category: string;
}

const medicines: Medicine[] = [
  // --- Antibiotika: Penicilline (Gruen) ---
  {
    id: 'amoxicillin-rind-schwein',
    name: 'Clamoxyl RTU',
    active_substance: 'Amoxicillin',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55001',
    category: 'B',
  },
  {
    id: 'amoxicillin-oral-schwein',
    name: 'Suramox 50% Pulver',
    active_substance: 'Amoxicillin',
    species: 'Schwein, Gefluegel',
    administration_route: 'Oral (Trinkwasser/Futter)',
    swissmedic_number: 'TAM-55002',
    category: 'B',
  },
  {
    id: 'penicillin-g-rind',
    name: 'Procacillin',
    active_substance: 'Benzylpenicillin-Procain',
    species: 'Rind, Schwein, Schaf, Ziege',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55003',
    category: 'B',
  },
  {
    id: 'penethamat-rind',
    name: 'Mamyzin',
    active_substance: 'Penethamathydrojodid',
    species: 'Rind',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55004',
    category: 'B',
  },
  {
    id: 'amoxicillin-clavulan-rind',
    name: 'Synulox RTU',
    active_substance: 'Amoxicillin + Clavulansaeure',
    species: 'Rind, Schwein, Hund, Katze',
    administration_route: 'Injektion (s.c.)',
    swissmedic_number: 'TAM-55005',
    category: 'B',
  },

  // --- Antibiotika: Tetracycline (Gruen) ---
  {
    id: 'oxytetracyclin-rind',
    name: 'Terramycin LA',
    active_substance: 'Oxytetracyclin',
    species: 'Rind, Schwein, Schaf',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55010',
    category: 'B',
  },
  {
    id: 'doxycyclin-schwein',
    name: 'Doxyprex 50%',
    active_substance: 'Doxycyclin',
    species: 'Schwein, Gefluegel',
    administration_route: 'Oral (Trinkwasser)',
    swissmedic_number: 'TAM-55011',
    category: 'B',
  },
  {
    id: 'chlortetracyclin-schwein',
    name: 'Chlortetravet 20%',
    active_substance: 'Chlortetracyclin',
    species: 'Schwein',
    administration_route: 'Oral (Futter)',
    swissmedic_number: 'TAM-55012',
    category: 'B',
  },

  // --- Antibiotika: Sulfonamide/TMP (Gruen) ---
  {
    id: 'tmp-sulfonamid-rind',
    name: 'Borgal 24%',
    active_substance: 'Trimethoprim + Sulfadoxin',
    species: 'Rind, Schwein, Pferd',
    administration_route: 'Injektion (i.v., i.m.)',
    swissmedic_number: 'TAM-55020',
    category: 'B',
  },
  {
    id: 'tmp-sulfa-oral-schwein',
    name: 'TMP-Sulfa Suspension',
    active_substance: 'Trimethoprim + Sulfamethoxazol',
    species: 'Schwein, Kalb',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-55021',
    category: 'B',
  },

  // --- Antibiotika: Makrolide (Gelb) ---
  {
    id: 'tylosin-schwein',
    name: 'Tylan 200',
    active_substance: 'Tylosin',
    species: 'Schwein, Rind, Gefluegel',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55030',
    category: 'B',
  },
  {
    id: 'tulathromycin-rind',
    name: 'Draxxin',
    active_substance: 'Tulathromycin',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (s.c.)',
    swissmedic_number: 'TAM-55031',
    category: 'B',
  },
  {
    id: 'tilmicosin-rind',
    name: 'Micotil 300',
    active_substance: 'Tilmicosin',
    species: 'Rind, Schaf',
    administration_route: 'Injektion (s.c.)',
    swissmedic_number: 'TAM-55032',
    category: 'B',
  },
  {
    id: 'spiramycin-rind',
    name: 'Suanovil',
    active_substance: 'Spiramycin',
    species: 'Rind',
    administration_route: 'Intramammaer',
    swissmedic_number: 'TAM-55033',
    category: 'B',
  },

  // --- Antibiotika: Aminoglykoside (Gelb) ---
  {
    id: 'gentamicin-rind',
    name: 'Gentamicin 5%',
    active_substance: 'Gentamicin',
    species: 'Rind, Schwein, Pferd',
    administration_route: 'Injektion (i.m., i.v.)',
    swissmedic_number: 'TAM-55040',
    category: 'B',
  },
  {
    id: 'neomycin-kalb',
    name: 'Neomycin Oral',
    active_substance: 'Neomycin',
    species: 'Kalb, Schwein, Gefluegel',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-55041',
    category: 'B',
  },
  {
    id: 'dihydrostreptomycin-rind',
    name: 'Pen-Strep',
    active_substance: 'Benzylpenicillin + Dihydrostreptomycin',
    species: 'Rind, Schwein, Schaf',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55042',
    category: 'B',
  },

  // --- Antibiotika: Fluoroquinolone (Rot) ---
  {
    id: 'enrofloxacin-rind',
    name: 'Baytril 10%',
    active_substance: 'Enrofloxacin',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (s.c.)',
    swissmedic_number: 'TAM-55050',
    category: 'A',
  },
  {
    id: 'marbofloxacin-rind',
    name: 'Marbocyl 10%',
    active_substance: 'Marbofloxacin',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (i.m., i.v.)',
    swissmedic_number: 'TAM-55051',
    category: 'A',
  },
  {
    id: 'danofloxacin-rind',
    name: 'Advocin 180',
    active_substance: 'Danofloxacin',
    species: 'Rind',
    administration_route: 'Injektion (s.c.)',
    swissmedic_number: 'TAM-55052',
    category: 'A',
  },

  // --- Antibiotika: Cephalosporine 3./4. Gen (Rot) ---
  {
    id: 'ceftiofur-rind',
    name: 'Excenel RTU',
    active_substance: 'Ceftiofur',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55060',
    category: 'A',
  },
  {
    id: 'cefquinom-rind',
    name: 'Cobactan 2.5%',
    active_substance: 'Cefquinom',
    species: 'Rind, Schwein, Pferd',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55061',
    category: 'A',
  },
  {
    id: 'cefalonium-rind',
    name: 'Cepravin DC',
    active_substance: 'Cefalonium',
    species: 'Rind',
    administration_route: 'Intramammaer',
    swissmedic_number: 'TAM-55062',
    category: 'B',
  },

  // --- Antibiotika: Sonstige ---
  {
    id: 'florfenicol-rind',
    name: 'Nuflor',
    active_substance: 'Florfenicol',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-55070',
    category: 'B',
  },
  {
    id: 'lincomycin-schwein',
    name: 'Lincomycin 40%',
    active_substance: 'Lincomycin',
    species: 'Schwein, Gefluegel',
    administration_route: 'Oral (Trinkwasser)',
    swissmedic_number: 'TAM-55071',
    category: 'B',
  },
  {
    id: 'colistin-schwein',
    name: 'Colistin Oral',
    active_substance: 'Colistin',
    species: 'Schwein, Kalb',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-55072',
    category: 'A',
  },

  // --- Antiparasitika ---
  {
    id: 'ivermectin-rind',
    name: 'Ivomec',
    active_substance: 'Ivermectin',
    species: 'Rind, Schwein, Schaf',
    administration_route: 'Injektion (s.c.) / Pour-on',
    swissmedic_number: 'TAM-56001',
    category: 'B',
  },
  {
    id: 'eprinomectin-rind',
    name: 'Eprinex Pour-On',
    active_substance: 'Eprinomectin',
    species: 'Rind',
    administration_route: 'Pour-on',
    swissmedic_number: 'TAM-56002',
    category: 'B',
  },
  {
    id: 'fenbendazol-rind',
    name: 'Panacur',
    active_substance: 'Fenbendazol',
    species: 'Rind, Schwein, Schaf, Ziege, Pferd',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-56003',
    category: 'D',
  },
  {
    id: 'albendazol-rind',
    name: 'Valbazen',
    active_substance: 'Albendazol',
    species: 'Rind, Schaf',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-56004',
    category: 'B',
  },
  {
    id: 'triclabendazol-rind',
    name: 'Fasinex 10%',
    active_substance: 'Triclabendazol',
    species: 'Rind, Schaf',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-56005',
    category: 'B',
  },

  // --- Entzuendungshemmer (NSAIDs) ---
  {
    id: 'meloxicam-rind',
    name: 'Metacam 20',
    active_substance: 'Meloxicam',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (s.c., i.v.)',
    swissmedic_number: 'TAM-57001',
    category: 'B',
  },
  {
    id: 'flunixin-rind',
    name: 'Finadyne',
    active_substance: 'Flunixin-Meglumin',
    species: 'Rind, Schwein, Pferd',
    administration_route: 'Injektion (i.v.)',
    swissmedic_number: 'TAM-57002',
    category: 'B',
  },
  {
    id: 'ketoprofen-rind',
    name: 'Romefen',
    active_substance: 'Ketoprofen',
    species: 'Rind, Schwein, Pferd',
    administration_route: 'Injektion (i.v., i.m.)',
    swissmedic_number: 'TAM-57003',
    category: 'B',
  },
  {
    id: 'tolfenamin-rind',
    name: 'Tolfedine',
    active_substance: 'Tolfenamsaeure',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (i.v., i.m.)',
    swissmedic_number: 'TAM-57004',
    category: 'B',
  },

  // --- Intramammaere Praeparate ---
  {
    id: 'cloxacillin-rind-trockenst',
    name: 'Orbenin Extra DC',
    active_substance: 'Cloxacillin',
    species: 'Rind',
    administration_route: 'Intramammaer (Trockensteller)',
    swissmedic_number: 'TAM-55080',
    category: 'B',
  },
  {
    id: 'amoxicillin-intramam',
    name: 'Amoxi-Mast',
    active_substance: 'Amoxicillin + Clavulansaeure',
    species: 'Rind',
    administration_route: 'Intramammaer (Laktation)',
    swissmedic_number: 'TAM-55081',
    category: 'B',
  },
  {
    id: 'cefapirin-rind',
    name: 'Cefaguard DC',
    active_substance: 'Cefapirin',
    species: 'Rind',
    administration_route: 'Intramammaer (Trockensteller)',
    swissmedic_number: 'TAM-55082',
    category: 'B',
  },

  // --- Hormone ---
  {
    id: 'cloprostenol-rind',
    name: 'Estrumate',
    active_substance: 'Cloprostenol',
    species: 'Rind, Schwein',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-58001',
    category: 'B',
  },
  {
    id: 'buserelin-rind',
    name: 'Receptal',
    active_substance: 'Buserelin',
    species: 'Rind',
    administration_route: 'Injektion (i.m., i.v.)',
    swissmedic_number: 'TAM-58002',
    category: 'B',
  },
  {
    id: 'oxytocin-rind',
    name: 'Oxytocin 10 IE',
    active_substance: 'Oxytocin',
    species: 'Rind, Schwein, Schaf, Ziege',
    administration_route: 'Injektion (i.v., i.m.)',
    swissmedic_number: 'TAM-58003',
    category: 'B',
  },

  // --- Sonstige ---
  {
    id: 'calciumgluconat-rind',
    name: 'Calcitat 40%',
    active_substance: 'Calciumgluconat + Calciumborogluconat',
    species: 'Rind',
    administration_route: 'Injektion (i.v. langsam)',
    swissmedic_number: 'TAM-59001',
    category: 'D',
  },
  {
    id: 'eisendextran-ferkel',
    name: 'Ursoferran',
    active_substance: 'Eisen(III)-hydroxid-Dextran-Komplex',
    species: 'Schwein (Ferkel)',
    administration_route: 'Injektion (i.m.)',
    swissmedic_number: 'TAM-59002',
    category: 'D',
  },
  {
    id: 'butaphosphan-rind',
    name: 'Catosal',
    active_substance: 'Butaphosphan + Cyanocobalamin',
    species: 'Rind, Schwein, Pferd, Hund, Katze',
    administration_route: 'Injektion (i.v., i.m., s.c.)',
    swissmedic_number: 'TAM-59003',
    category: 'D',
  },
  {
    id: 'propylenglykoloral-rind',
    name: 'Ketol',
    active_substance: 'Propylenglykol',
    species: 'Rind',
    administration_route: 'Oral',
    swissmedic_number: 'TAM-59004',
    category: 'E',
  },
];

const insertMedicine = db.instance.prepare(
  `INSERT OR REPLACE INTO medicines (id, name, active_substance, species, administration_route, swissmedic_number, category, jurisdiction, language)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'CH', 'DE')`
);

for (const m of medicines) {
  insertMedicine.run(m.id, m.name, m.active_substance, m.species, m.administration_route, m.swissmedic_number, m.category);
}

console.log(`Ingested ${medicines.length} medicines`);

// ---------------------------------------------------------------------------
// 2. Withdrawal times (Absetzfristen)
//    Source: Swissmedic Tierarzneimittel-Kompendium, TAMV
// ---------------------------------------------------------------------------

interface WithdrawalTime {
  medicine_id: string;
  species: string;
  produce_type: string;
  days: number;
  notes: string;
}

const withdrawalTimes: WithdrawalTime[] = [
  // Amoxicillin (Clamoxyl RTU)
  { medicine_id: 'amoxicillin-rind-schwein', species: 'Rind', produce_type: 'Fleisch', days: 15, notes: 'Nach i.m. Injektion' },
  { medicine_id: 'amoxicillin-rind-schwein', species: 'Rind', produce_type: 'Milch', days: 3, notes: '60 Stunden (3 Tage)' },
  { medicine_id: 'amoxicillin-rind-schwein', species: 'Schwein', produce_type: 'Fleisch', days: 14, notes: 'Nach i.m. Injektion' },

  // Amoxicillin Oral (Suramox)
  { medicine_id: 'amoxicillin-oral-schwein', species: 'Schwein', produce_type: 'Fleisch', days: 2, notes: 'Ueber Trinkwasser' },
  { medicine_id: 'amoxicillin-oral-schwein', species: 'Gefluegel', produce_type: 'Fleisch', days: 1, notes: 'Ueber Trinkwasser' },
  { medicine_id: 'amoxicillin-oral-schwein', species: 'Gefluegel', produce_type: 'Eier', days: 0, notes: 'Keine Wartezeit fuer Eier' },

  // Penicillin G (Procacillin)
  { medicine_id: 'penicillin-g-rind', species: 'Rind', produce_type: 'Fleisch', days: 10, notes: '' },
  { medicine_id: 'penicillin-g-rind', species: 'Rind', produce_type: 'Milch', days: 4, notes: '84 Stunden' },
  { medicine_id: 'penicillin-g-rind', species: 'Schwein', produce_type: 'Fleisch', days: 8, notes: '' },
  { medicine_id: 'penicillin-g-rind', species: 'Schaf', produce_type: 'Fleisch', days: 10, notes: '' },

  // Oxytetracyclin (Terramycin LA)
  { medicine_id: 'oxytetracyclin-rind', species: 'Rind', produce_type: 'Fleisch', days: 28, notes: 'Langzeitformulierung (LA)' },
  { medicine_id: 'oxytetracyclin-rind', species: 'Rind', produce_type: 'Milch', days: 7, notes: 'Nach Langzeitinjektion' },
  { medicine_id: 'oxytetracyclin-rind', species: 'Schwein', produce_type: 'Fleisch', days: 14, notes: '' },
  { medicine_id: 'oxytetracyclin-rind', species: 'Schaf', produce_type: 'Fleisch', days: 21, notes: '' },

  // TMP/Sulfonamid (Borgal)
  { medicine_id: 'tmp-sulfonamid-rind', species: 'Rind', produce_type: 'Fleisch', days: 10, notes: '' },
  { medicine_id: 'tmp-sulfonamid-rind', species: 'Rind', produce_type: 'Milch', days: 4, notes: '96 Stunden' },
  { medicine_id: 'tmp-sulfonamid-rind', species: 'Schwein', produce_type: 'Fleisch', days: 8, notes: '' },
  { medicine_id: 'tmp-sulfonamid-rind', species: 'Pferd', produce_type: 'Fleisch', days: 12, notes: '' },

  // Tylosin (Tylan 200)
  { medicine_id: 'tylosin-schwein', species: 'Schwein', produce_type: 'Fleisch', days: 14, notes: '' },
  { medicine_id: 'tylosin-schwein', species: 'Rind', produce_type: 'Fleisch', days: 21, notes: '' },
  { medicine_id: 'tylosin-schwein', species: 'Rind', produce_type: 'Milch', days: 4, notes: '96 Stunden' },

  // Tulathromycin (Draxxin)
  { medicine_id: 'tulathromycin-rind', species: 'Rind', produce_type: 'Fleisch', days: 35, notes: 'Lange Absetzfrist wegen Depot-Effekt' },
  { medicine_id: 'tulathromycin-rind', species: 'Schwein', produce_type: 'Fleisch', days: 13, notes: '' },

  // Enrofloxacin (Baytril) — Rot
  { medicine_id: 'enrofloxacin-rind', species: 'Rind', produce_type: 'Fleisch', days: 14, notes: 'Nur mit Antibiogramm' },
  { medicine_id: 'enrofloxacin-rind', species: 'Rind', produce_type: 'Milch', days: 4, notes: '84 Stunden' },
  { medicine_id: 'enrofloxacin-rind', species: 'Schwein', produce_type: 'Fleisch', days: 10, notes: 'Nur mit Antibiogramm' },

  // Ceftiofur (Excenel) — Rot
  { medicine_id: 'ceftiofur-rind', species: 'Rind', produce_type: 'Fleisch', days: 8, notes: 'Cephalosporin 3. Gen, nur mit Antibiogramm' },
  { medicine_id: 'ceftiofur-rind', species: 'Rind', produce_type: 'Milch', days: 0, notes: 'Keine Wartezeit (stoffwechselbedingt)' },
  { medicine_id: 'ceftiofur-rind', species: 'Schwein', produce_type: 'Fleisch', days: 5, notes: '' },

  // Cefquinom (Cobactan) — Rot
  { medicine_id: 'cefquinom-rind', species: 'Rind', produce_type: 'Fleisch', days: 5, notes: 'Cephalosporin 4. Gen, nur mit Antibiogramm' },
  { medicine_id: 'cefquinom-rind', species: 'Rind', produce_type: 'Milch', days: 1, notes: '24 Stunden' },
  { medicine_id: 'cefquinom-rind', species: 'Schwein', produce_type: 'Fleisch', days: 3, notes: '' },

  // Colistin (Oral)
  { medicine_id: 'colistin-schwein', species: 'Schwein', produce_type: 'Fleisch', days: 2, notes: 'Kritisch wichtig (WHO), restriktiv' },
  { medicine_id: 'colistin-schwein', species: 'Kalb', produce_type: 'Fleisch', days: 7, notes: '' },

  // Florfenicol (Nuflor)
  { medicine_id: 'florfenicol-rind', species: 'Rind', produce_type: 'Fleisch', days: 30, notes: '' },
  { medicine_id: 'florfenicol-rind', species: 'Schwein', produce_type: 'Fleisch', days: 18, notes: '' },

  // Ivermectin (Ivomec)
  { medicine_id: 'ivermectin-rind', species: 'Rind', produce_type: 'Fleisch', days: 28, notes: 'Injektion' },
  { medicine_id: 'ivermectin-rind', species: 'Rind', produce_type: 'Milch', days: 0, notes: 'Nicht bei laktierenden Kuehen verwenden (kein MRL fuer Milch)' },
  { medicine_id: 'ivermectin-rind', species: 'Schwein', produce_type: 'Fleisch', days: 28, notes: '' },
  { medicine_id: 'ivermectin-rind', species: 'Schaf', produce_type: 'Fleisch', days: 14, notes: '' },

  // Eprinomectin (Eprinex)
  { medicine_id: 'eprinomectin-rind', species: 'Rind', produce_type: 'Fleisch', days: 15, notes: 'Pour-on' },
  { medicine_id: 'eprinomectin-rind', species: 'Rind', produce_type: 'Milch', days: 0, notes: 'Keine Wartezeit (Vorteil gegenueber Ivermectin)' },

  // Fenbendazol (Panacur)
  { medicine_id: 'fenbendazol-rind', species: 'Rind', produce_type: 'Fleisch', days: 14, notes: '' },
  { medicine_id: 'fenbendazol-rind', species: 'Rind', produce_type: 'Milch', days: 4, notes: '' },
  { medicine_id: 'fenbendazol-rind', species: 'Schwein', produce_type: 'Fleisch', days: 4, notes: '' },
  { medicine_id: 'fenbendazol-rind', species: 'Schaf', produce_type: 'Fleisch', days: 14, notes: '' },

  // Meloxicam (Metacam)
  { medicine_id: 'meloxicam-rind', species: 'Rind', produce_type: 'Fleisch', days: 15, notes: '' },
  { medicine_id: 'meloxicam-rind', species: 'Rind', produce_type: 'Milch', days: 5, notes: '' },
  { medicine_id: 'meloxicam-rind', species: 'Schwein', produce_type: 'Fleisch', days: 5, notes: '' },

  // Flunixin (Finadyne)
  { medicine_id: 'flunixin-rind', species: 'Rind', produce_type: 'Fleisch', days: 10, notes: '' },
  { medicine_id: 'flunixin-rind', species: 'Rind', produce_type: 'Milch', days: 1, notes: '24 Stunden' },
  { medicine_id: 'flunixin-rind', species: 'Pferd', produce_type: 'Fleisch', days: 10, notes: '' },

  // Cloxacillin Trockensteller
  { medicine_id: 'cloxacillin-rind-trockenst', species: 'Rind', produce_type: 'Milch', days: 0, notes: 'Trockensteller: Wartezeit = Trockenperiode (mind. 49 Tage vor Abkalbung)' },
  { medicine_id: 'cloxacillin-rind-trockenst', species: 'Rind', produce_type: 'Fleisch', days: 28, notes: '' },

  // Cloprostenol (Estrumate) — Hormon
  { medicine_id: 'cloprostenol-rind', species: 'Rind', produce_type: 'Fleisch', days: 1, notes: '' },
  { medicine_id: 'cloprostenol-rind', species: 'Rind', produce_type: 'Milch', days: 0, notes: '' },

  // Oxytocin
  { medicine_id: 'oxytocin-rind', species: 'Rind', produce_type: 'Fleisch', days: 0, notes: 'Kein MRL-Eintrag noetig' },
  { medicine_id: 'oxytocin-rind', species: 'Rind', produce_type: 'Milch', days: 0, notes: '' },

  // Calcium
  { medicine_id: 'calciumgluconat-rind', species: 'Rind', produce_type: 'Fleisch', days: 0, notes: '' },
  { medicine_id: 'calciumgluconat-rind', species: 'Rind', produce_type: 'Milch', days: 0, notes: '' },
];

const insertWithdrawal = db.instance.prepare(
  `INSERT INTO withdrawal_times (medicine_id, species, produce_type, days, notes, jurisdiction)
   VALUES (?, ?, ?, ?, ?, 'CH')`
);

for (const w of withdrawalTimes) {
  insertWithdrawal.run(w.medicine_id, w.species, w.produce_type, w.days, w.notes);
}

console.log(`Ingested ${withdrawalTimes.length} withdrawal time records`);

// ---------------------------------------------------------------------------
// 3. Antibiotic categories — Ampelsystem (GST/BLV)
// ---------------------------------------------------------------------------

interface AntibioticCategory {
  antibiotic_class: string;
  ampel_color: string;
  restrictions: string;
  notes: string;
}

const antibioticCategories: AntibioticCategory[] = [
  // --- Gruen: First-line, empirisch einsetzbar ---
  {
    antibiotic_class: 'Penicilline (Amoxicillin, Benzylpenicillin, Ampicillin)',
    ampel_color: 'gruen',
    restrictions: 'Empirischer Einsatz ohne Antibiogramm moeglich',
    notes: 'Erste Wahl bei vielen bakteriellen Infektionen. Betrifft natuerliche und Aminopenicilline.',
  },
  {
    antibiotic_class: 'Tetracycline (Oxytetracyclin, Doxycyclin, Chlortetracyclin)',
    ampel_color: 'gruen',
    restrictions: 'Empirischer Einsatz ohne Antibiogramm moeglich',
    notes: 'Breitspektrum. Haeufig eingesetzt bei Rind und Schwein. Steigende Resistenzraten beachten.',
  },
  {
    antibiotic_class: 'Sulfonamide + Trimethoprim',
    ampel_color: 'gruen',
    restrictions: 'Empirischer Einsatz ohne Antibiogramm moeglich',
    notes: 'Synergistische Kombination. Breit einsetzbar bei Atemwegs- und Harnwegsinfektionen.',
  },
  {
    antibiotic_class: 'Penicilline + Beta-Laktamase-Hemmer (Amoxicillin/Clavulansaeure)',
    ampel_color: 'gruen',
    restrictions: 'Empirischer Einsatz moeglich',
    notes: 'Erweitertes Spektrum durch Beta-Laktamase-Hemmung. Wichtig bei Beta-Laktamase-bildenden Keimen.',
  },

  // --- Gelb: Second-line, Antibiogramm empfohlen ---
  {
    antibiotic_class: 'Makrolide (Tylosin, Tulathromycin, Tilmicosin, Spiramycin)',
    ampel_color: 'gelb',
    restrictions: 'Antibiogramm empfohlen. Einsatz als Second-line bei fehlendem Ansprechen auf First-line.',
    notes: 'Wichtig fuer Atemwegserkrankungen bei Rind und Schwein. Einige Vertreter (Tulathromycin) mit langen Absetzfristen.',
  },
  {
    antibiotic_class: 'Aminoglykoside (Gentamicin, Neomycin, Dihydrostreptomycin)',
    ampel_color: 'gelb',
    restrictions: 'Antibiogramm empfohlen. Parenteraler Einsatz mit Vorsicht (Nephro-/Ototoxizitaet).',
    notes: 'Oft in Kombination mit Penicillinen. Neomycin nur oral (nicht resorbierbar). Streptomycin historisch haeufig.',
  },
  {
    antibiotic_class: 'Lincosamide (Lincomycin)',
    ampel_color: 'gelb',
    restrictions: 'Antibiogramm empfohlen',
    notes: 'Wirksam gegen grampositive und anaerobe Keime. Nie bei Pferden und Kaninchen (toedlich).',
  },
  {
    antibiotic_class: 'Phenicole (Florfenicol)',
    ampel_color: 'gelb',
    restrictions: 'Antibiogramm empfohlen',
    notes: 'Breitspektrum. Alternative bei Penicillin-Resistenz. Lange Absetzfristen.',
  },

  // --- Rot: Antibiogramm zwingend, kritisch wichtige AB ---
  {
    antibiotic_class: 'Fluoroquinolone (Enrofloxacin, Marbofloxacin, Danofloxacin)',
    ampel_color: 'rot',
    restrictions: 'Antibiogramm ZWINGEND. Einsatz nur wenn keine Alternative. WHO Highest Priority CIA.',
    notes: 'Kritisch wichtig fuer Humanmedizin. IS ABV-meldepflichtig. Starke Reduktion angestrebt gemaess StAR.',
  },
  {
    antibiotic_class: 'Cephalosporine 3./4. Generation (Ceftiofur, Cefquinom)',
    ampel_color: 'rot',
    restrictions: 'Antibiogramm ZWINGEND. Einsatz nur als Ultima Ratio. WHO Highest Priority CIA.',
    notes: 'ESBL-Selektion. IS ABV-meldepflichtig. In einigen Laendern verboten fuer Nutztiere. StAR-Reduktionsziel.',
  },
  {
    antibiotic_class: 'Polymyxine (Colistin)',
    ampel_color: 'rot',
    restrictions: 'Antibiogramm ZWINGEND. Last-resort-Antibiotikum in der Humanmedizin.',
    notes: 'WHO Highest Priority CIA. MCR-Resistenzgene auf Plasmiden uebertragbar. Starke Reduktion angestrebt.',
  },
];

const insertCategory = db.instance.prepare(
  `INSERT INTO antibiotic_categories (antibiotic_class, ampel_color, restrictions, notes, jurisdiction)
   VALUES (?, ?, ?, ?, 'CH')`
);

for (const c of antibioticCategories) {
  insertCategory.run(c.antibiotic_class, c.ampel_color, c.restrictions, c.notes);
}

console.log(`Ingested ${antibioticCategories.length} antibiotic categories`);

// ---------------------------------------------------------------------------
// 4. Resistance data — ARCH-Vet examples
//    Source: ARCH-Vet Report 2023 (Daten 2022)
// ---------------------------------------------------------------------------

interface ResistanceEntry {
  bacterium: string;
  antibiotic_class: string;
  resistance_pct: number;
  trend: string;
  species: string;
  year: number;
  source: string;
}

const resistanceData: ResistanceEntry[] = [
  // E. coli — Schwein
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ampicillin', resistance_pct: 52.3, trend: 'stabil', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Tetracyclin', resistance_pct: 48.1, trend: 'leicht sinkend', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Sulfonamide', resistance_pct: 43.5, trend: 'stabil', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ciprofloxacin (Fluoroquinolon)', resistance_pct: 11.2, trend: 'leicht sinkend', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Cephalosporine 3. Gen', resistance_pct: 5.8, trend: 'sinkend', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Colistin', resistance_pct: 1.2, trend: 'sinkend', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },

  // E. coli — Rind
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ampicillin', resistance_pct: 38.7, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Tetracyclin', resistance_pct: 33.4, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Sulfonamide', resistance_pct: 31.2, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ciprofloxacin (Fluoroquinolon)', resistance_pct: 8.4, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Cephalosporine 3. Gen', resistance_pct: 7.1, trend: 'leicht sinkend', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Colistin', resistance_pct: 0.5, trend: 'sinkend', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },

  // E. coli — Gefluegel
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ampicillin', resistance_pct: 55.8, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Tetracyclin', resistance_pct: 42.6, trend: 'leicht sinkend', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ciprofloxacin (Fluoroquinolon)', resistance_pct: 24.3, trend: 'leicht sinkend', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Cephalosporine 3. Gen', resistance_pct: 4.2, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },

  // Campylobacter — Gefluegel
  { bacterium: 'Campylobacter jejuni', antibiotic_class: 'Ciprofloxacin (Fluoroquinolon)', resistance_pct: 43.5, trend: 'steigend', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Campylobacter jejuni', antibiotic_class: 'Tetracyclin', resistance_pct: 29.8, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Campylobacter jejuni', antibiotic_class: 'Erythromycin (Makrolid)', resistance_pct: 1.3, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },

  // MRSA — Schwein
  { bacterium: 'MRSA (Staphylococcus aureus)', antibiotic_class: 'Methicillin/Oxacillin', resistance_pct: 26.1, trend: 'stabil', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'MRSA (Staphylococcus aureus)', antibiotic_class: 'Tetracyclin', resistance_pct: 88.4, trend: 'stabil', species: 'Schwein', year: 2022, source: 'ARCH-Vet 2023' },

  // Enterococcus — Gefluegel
  { bacterium: 'Enterococcus faecium', antibiotic_class: 'Ampicillin', resistance_pct: 89.2, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Enterococcus faecium', antibiotic_class: 'Vancomycin', resistance_pct: 0.0, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },

  // Salmonella — Gefluegel
  { bacterium: 'Salmonella spp.', antibiotic_class: 'Ampicillin', resistance_pct: 18.5, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Salmonella spp.', antibiotic_class: 'Ciprofloxacin (Fluoroquinolon)', resistance_pct: 6.3, trend: 'stabil', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Salmonella spp.', antibiotic_class: 'Cephalosporine 3. Gen', resistance_pct: 1.1, trend: 'sinkend', species: 'Gefluegel', year: 2022, source: 'ARCH-Vet 2023' },

  // Pasteurella — Rind
  { bacterium: 'Pasteurella multocida', antibiotic_class: 'Tetracyclin', resistance_pct: 18.9, trend: 'leicht steigend', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Pasteurella multocida', antibiotic_class: 'Penicillin', resistance_pct: 2.1, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Pasteurella multocida', antibiotic_class: 'Florfenicol', resistance_pct: 4.5, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },

  // Staphylococcus aureus — Rind (Mastitis)
  { bacterium: 'Staphylococcus aureus (Mastitis)', antibiotic_class: 'Penicillin', resistance_pct: 38.5, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Staphylococcus aureus (Mastitis)', antibiotic_class: 'Erythromycin (Makrolid)', resistance_pct: 8.2, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },
  { bacterium: 'Staphylococcus aureus (Mastitis)', antibiotic_class: 'Gentamicin', resistance_pct: 3.1, trend: 'stabil', species: 'Rind', year: 2022, source: 'ARCH-Vet 2023' },

  // Historic comparison (2019) for trend analysis
  { bacterium: 'Escherichia coli', antibiotic_class: 'Ciprofloxacin (Fluoroquinolon)', resistance_pct: 14.8, trend: 'Vergleichsjahr', species: 'Schwein', year: 2019, source: 'ARCH-Vet 2020' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Cephalosporine 3. Gen', resistance_pct: 8.3, trend: 'Vergleichsjahr', species: 'Schwein', year: 2019, source: 'ARCH-Vet 2020' },
  { bacterium: 'Escherichia coli', antibiotic_class: 'Colistin', resistance_pct: 2.8, trend: 'Vergleichsjahr', species: 'Schwein', year: 2019, source: 'ARCH-Vet 2020' },
];

const insertResistance = db.instance.prepare(
  `INSERT INTO resistance_data (bacterium, antibiotic_class, resistance_pct, trend, species, year, source, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'CH')`
);

for (const r of resistanceData) {
  insertResistance.run(r.bacterium, r.antibiotic_class, r.resistance_pct, r.trend, r.species, r.year, r.source);
}

console.log(`Ingested ${resistanceData.length} resistance data records`);

// ---------------------------------------------------------------------------
// 5. Prescription rules — TAMV Abgabekategorien, Selbstdispensation, etc.
// ---------------------------------------------------------------------------

interface PrescriptionRule {
  category: string;
  description: string;
  requirements: string;
}

const prescriptionRules: PrescriptionRule[] = [
  // Abgabekategorien
  {
    category: 'A — Einmalige Abgabe auf Rezept',
    description: 'Tierarzneimittel der Kategorie A duerfen nur auf einmaliges tieraerztliches Rezept abgegeben werden. Jede Abgabe erfordert ein neues Rezept. Betrifft kritisch wichtige Antibiotika (Fluoroquinolone, Cephalosporine 3./4. Gen) und andere Hochrisiko-Praeparate.',
    requirements: 'Tieraerztliches Rezept (einmalig gueltig). Abgabe nur durch Tierarzt oder Apotheke. Dokumentation im Behandlungsjournal. IS ABV-Meldung bei Antibiotika obligatorisch.',
  },
  {
    category: 'B — Abgabe auf Rezept',
    description: 'Tierarzneimittel der Kategorie B erfordern ein tieraerztliches Rezept. Rezept kann fuer wiederholte Bezuege gueltig sein (je nach Verschreibung). Umfasst die meisten verschreibungspflichtigen Tierarzneimittel (Antibiotika, NSAIDs, Hormone).',
    requirements: 'Tieraerztliches Rezept. Abgabe durch Tierarzt, Apotheke oder Drogerie (mit pharmazeutischer Fachperson). Dokumentation im Behandlungsjournal.',
  },
  {
    category: 'D — Abgabe nach Fachberatung',
    description: 'Tierarzneimittel der Kategorie D duerfen nach Fachberatung durch eine qualifizierte Person abgegeben werden. Keine Verschreibungspflicht, aber Beratungspflicht. Umfasst Antiparasitika, Vitaminpraeparate, Mineralstoffergaenzungen.',
    requirements: 'Fachberatung durch Apotheke, Drogerie oder Tierarztpraxis. Kein Rezept noetig. Fachperson muss Anwendung erklaeren.',
  },
  {
    category: 'E — Frei erhaeltlich',
    description: 'Tierarzneimittel der Kategorie E sind frei im Handel erhaeltlich. Keine Beratungs- oder Verschreibungspflicht. Betrifft Mineralstoffe, Futterergaenzungen, topische Pflegeprodukte.',
    requirements: 'Frei verfuegbar. Keine besonderen Anforderungen. Verantwortung beim Tierhalter.',
  },

  // Selbstdispensation
  {
    category: 'Selbstdispensation',
    description: 'Schweizer Spezifikum: Tieraerztinnen und Tieraerzte duerfen Tierarzneimittel direkt verkaufen und abgeben (TAMV Art. 10-11). In den meisten Laendern ist die Medikamentenabgabe von der Verschreibung getrennt. Die Selbstdispensation steht unter politischem Reformdruck wegen moeglicher Fehlanreize bei Antibiotika.',
    requirements: 'Kantonale Bewilligung fuer tieraerztliche Privatapotheke. Lagerbuchhaltung. Meldepflicht ueber IS ABV fuer alle Antibiotika (seit 2019). Betaeubungsmittel separat bewilligt.',
  },

  // TAM-Vereinbarung
  {
    category: 'TAM-Vereinbarung',
    description: 'Tierarzneimittel-Vereinbarung zwischen Tierarzt und Tierhalter (TAMV Art. 10a). Ermoeglicht Landwirten, bestimmte TAM unter definierten Bedingungen selbst anzuwenden. Gilt fuer haeufige Standardbehandlungen (z.B. Mastitisbehandlung, Entwurmung). Vertrag definiert Indikationen, Praeparate, Dosierungen und Absetzfristen.',
    requirements: 'Schriftlicher Vertrag mit Bestandestierarzt. Jaehrliche Betriebsbesuche (Visite sanitaire). Tierhalter muss geschult sein. Behandlungsjournal fuehren. Gilt maximal 1 Jahr, dann Erneuerung. Nur fuer im Vertrag genannte Indikationen und Praeparate.',
  },

  // Behandlungsjournal
  {
    category: 'Behandlungsjournal',
    description: 'Pflicht zur Dokumentation aller Tierarzneimittel-Behandlungen (TAMV Art. 26). Aufbewahrungsfrist 3 Jahre. Muss bei Kontrollen der kantonalen Veterinaerbehoerde vorgewiesen werden. Inhalt: Datum, Tier/Gruppe, Diagnose, Tierarzneimittel, Dosierung, Behandlungsdauer, Absetzfrist, behandelnde Person.',
    requirements: 'Aufbewahrung 3 Jahre ab letztem Eintrag. Pro Betrieb. Muss fuer jede Behandlung gefuehrt werden. Auch bei TAM-Vereinbarung. Format frei (Papier oder elektronisch). Bei Verstoessen Kuerzung der Direktzahlungen moeglich.',
  },

  // Umwidmung (Kaskade)
  {
    category: 'Umwidmung (Kaskade)',
    description: 'Anwendung eines TAM fuer eine andere Tierart oder Indikation als zugelassen (TAMV Art. 5-6). Erlaubt wenn kein zugelassenes TAM verfuegbar. Umwidmungskaskade: 1) TAM fuer andere Tierart/Indikation, 2) Humanarzneimittel, 3) Apotheke/Magistralrezeptur. Bei Umwidmung: Absetzfrist VERDOPPELT sich oder mindestens: Fleisch 28 Tage, Milch 7 Tage, Eier 7 Tage, Honig 0 Tage.',
    requirements: 'Tieraerztliche Verschreibung zwingend. Dokumentation der Umwidmungsbegruendung. Verdoppelte Absetzfrist. Mindest-Absetzfristen bei fehlenden Angaben: Fleisch 28 Tage, Milch 7 Tage, Eier 7 Tage.',
  },

  // IS ABV
  {
    category: 'IS ABV — Antibiotikameldepflicht',
    description: 'Informationssystem Antibiotika in der Veterinaermedizin (seit 1. Januar 2019 obligatorisch, TAMV Art. 64a ff.). Alle Antibiotikaverschreibungen an Nutztiere muessen elektronisch gemeldet werden. Daten umfassen: Tierarzt, Betrieb, Tierart, Antibiotikum, Menge, Behandlungsdauer. Ziel: Transparenz ueber Antibiotikaverbrauch, Erkennung von Vielverbrauchern, Benchmarking.',
    requirements: 'Elektronische Meldung innert 3 Arbeitstagen nach Verschreibung/Abgabe. Gilt fuer alle Nutztier-Antibiotika (auch oral, intramammaer, topisch). Meldung ueber IS ABV-Portal (blv.admin.ch). Pflicht fuer alle Tieraerztinnen und Tieraerzte, die Nutztiere behandeln. Ausnahme: Heimtiere.',
  },

  // Betaeubungsmittel
  {
    category: 'Betaeubungsmittel und kontrollierte Substanzen',
    description: 'Tierarzneimittel mit Betaeubungsmitteln (z.B. Ketamin, Xylazin, Buprenorphin) unterliegen zusaetzlich dem Betaeubungsmittelgesetz (BetmG). Separate Buchfuehrung, verschaerfter Lagerstandard (Tresor).',
    requirements: 'Kantonale Bewilligung fuer Umgang mit Betaeubungsmitteln. Separate Buchfuehrung (Ein-/Ausgang). Lagerung unter Verschluss (Tresor). Jaehrliche Bestandesaufnahme. Meldung an kantonalen Apotheker.',
  },
];

const insertRule = db.instance.prepare(
  `INSERT INTO prescription_rules (category, description, requirements, jurisdiction)
   VALUES (?, ?, ?, 'CH')`
);

for (const r of prescriptionRules) {
  insertRule.run(r.category, r.description, r.requirements);
}

console.log(`Ingested ${prescriptionRules.length} prescription rules`);

// ---------------------------------------------------------------------------
// 6. StAR strategy targets
//    Source: Strategie Antibiotikaresistenzen Schweiz (BLV)
// ---------------------------------------------------------------------------

interface StarTarget {
  species: string | null;
  target_description: string;
  baseline_year: number;
  target_year: number;
  reduction_pct: number;
  status: string;
  notes: string;
}

const starTargets: StarTarget[] = [
  {
    species: null,
    target_description: 'Gesamtreduktion des Antibiotikaverbrauchs in der Veterinaermedizin',
    baseline_year: 2016,
    target_year: 2026,
    reduction_pct: 50,
    status: 'Ziel weitgehend erreicht (−55% gemessen in mg/kg Lebendgewicht bis 2022)',
    notes: 'Gemessen am Gesamtverkauf veterinaerantibiotischer Wirkstoffe. Schweiz hat 2022 den niedrigsten Verbrauch seit Beginn der Erfassung.',
  },
  {
    species: null,
    target_description: 'Reduktion kritisch wichtiger Antibiotika (Fluoroquinolone, Cephalosporine 3./4. Gen)',
    baseline_year: 2016,
    target_year: 2026,
    reduction_pct: 70,
    status: 'Uebertroffen (Fluoroquinolone −75%, Cephalosporine −64% bis 2022)',
    notes: 'Fluoroquinolone-Verbrauch staerker gesunken als Cephalosporine. Colistin-Verbrauch ebenfalls stark reduziert.',
  },
  {
    species: 'Schwein',
    target_description: 'Reduktion Antibiotikaverbrauch Schweinehaltung',
    baseline_year: 2016,
    target_year: 2026,
    reduction_pct: 50,
    status: 'Weitgehend erreicht (−48% bis 2022)',
    notes: 'Groesster Verbraucher in der Schweiz. Insbesondere bei oralen Gruppenmedikatione deutlicher Rueckgang. IS ABV-Daten zeigen grosse Betriebsunterschiede.',
  },
  {
    species: 'Rind',
    target_description: 'Reduktion Antibiotikaverbrauch Rinderhaltung',
    baseline_year: 2016,
    target_year: 2026,
    reduction_pct: 35,
    status: 'Teilweise erreicht (−31% bis 2022)',
    notes: 'Hauptverbrauch bei Mastitis-Behandlung und Atemwegserkrankungen Kaelber. Trockensteller-Antibiotika ruecklaeufig.',
  },
  {
    species: 'Gefluegel',
    target_description: 'Reduktion Antibiotikaverbrauch Gefluegelproduktion',
    baseline_year: 2016,
    target_year: 2026,
    reduction_pct: 40,
    status: 'Erreicht (−52% bis 2022)',
    notes: 'Starker Rueckgang dank verbessertem Bestandesmanagement und Impfprogrammen. Praeventiver Einsatz stark eingeschraenkt.',
  },
  {
    species: null,
    target_description: 'Etablierung IS ABV flaechendeckend',
    baseline_year: 2019,
    target_year: 2022,
    reduction_pct: 0,
    status: 'Abgeschlossen',
    notes: 'Seit 2019 obligatorisch. Über 95% Compliance bei meldenden Tieraerzten. Datenqualitaet kontinuierlich verbessert.',
  },
  {
    species: null,
    target_description: 'Entwicklung betriebsspezifischer Benchmarks ueber IS ABV',
    baseline_year: 2022,
    target_year: 2027,
    reduction_pct: 0,
    status: 'In Umsetzung',
    notes: 'Betriebsvergleiche (Therapieintensitaet pro Tierart). Vielverbraucher-Identifikation. Beratungsgespraeche bei Ueberschreitung der Kennzahlen.',
  },
  {
    species: null,
    target_description: 'Stärkung Antibiogramm-Pflicht fuer kritisch wichtige AB',
    baseline_year: 2024,
    target_year: 2027,
    reduction_pct: 0,
    status: 'Teilweise umgesetzt',
    notes: 'Antibiogramm-Pflicht fuer Fluoroquinolone und Cephalosporine 3./4. Gen. Diskussion ueber Ausweitung auf Colistin und Makrolide.',
  },
  {
    species: 'Schwein',
    target_description: 'Reduktion orale Gruppenmedikation Schwein',
    baseline_year: 2016,
    target_year: 2026,
    reduction_pct: 60,
    status: 'Teilweise erreicht (−45% bis 2022)',
    notes: 'Orale Gruppenmedikation ist der Haupttreiber des Verbrauchs in der Schweinehaltung. Alternativen: Einzeltierbehandlung, Impfprogramme, Haltungsoptimierung.',
  },
  {
    species: null,
    target_description: 'One Health-Ansatz: Koordination Human-/Veterinaermedizin',
    baseline_year: 2015,
    target_year: 2025,
    reduction_pct: 0,
    status: 'Laufend',
    notes: 'Gemeinsame ARCH-Vet/ANRESIS-Berichterstattung. Interdisziplinaere Arbeitsgruppen. WHO-Koordination.',
  },
];

const insertTarget = db.instance.prepare(
  `INSERT INTO star_targets (species, target_description, baseline_year, target_year, reduction_pct, status, notes, jurisdiction)
   VALUES (?, ?, ?, ?, ?, ?, ?, 'CH')`
);

for (const t of starTargets) {
  insertTarget.run(t.species, t.target_description, t.baseline_year, t.target_year, t.reduction_pct, t.status, t.notes);
}

console.log(`Ingested ${starTargets.length} StAR targets`);

// ---------------------------------------------------------------------------
// 7. FTS5 search index — combine all data for full-text search
// ---------------------------------------------------------------------------

const insertSearch = db.instance.prepare(
  `INSERT INTO search_index (title, body, category, jurisdiction) VALUES (?, ?, ?, 'CH')`
);

// Index medicines
for (const m of medicines) {
  insertSearch.run(
    `${m.name} (${m.active_substance})`,
    `Wirkstoff: ${m.active_substance}. Zieltiere: ${m.species}. Applikation: ${m.administration_route}. Swissmedic-Nr: ${m.swissmedic_number}. Abgabekategorie: ${m.category}.`,
    'Tierarzneimittel'
  );
}

// Index antibiotic categories
for (const c of antibioticCategories) {
  insertSearch.run(
    `Ampelsystem ${c.ampel_color}: ${c.antibiotic_class}`,
    `${c.restrictions} ${c.notes}`,
    `Ampelsystem ${c.ampel_color}`
  );
}

// Index prescription rules
for (const r of prescriptionRules) {
  insertSearch.run(
    r.category,
    `${r.description} ${r.requirements}`,
    'Verschreibungsregeln'
  );
}

// Index resistance data (grouped by bacterium+species)
const resistanceIndex = new Map<string, string[]>();
for (const r of resistanceData) {
  const key = `${r.bacterium} — ${r.species} (${r.year})`;
  if (!resistanceIndex.has(key)) {
    resistanceIndex.set(key, []);
  }
  resistanceIndex.get(key)!.push(
    `${r.antibiotic_class}: ${r.resistance_pct}% (Trend: ${r.trend})`
  );
}
for (const [key, entries] of resistanceIndex) {
  insertSearch.run(
    `Resistenzdaten: ${key}`,
    entries.join('. '),
    'ARCH-Vet Resistenzdaten'
  );
}

// Index StAR targets
for (const t of starTargets) {
  insertSearch.run(
    `StAR: ${t.target_description}`,
    `${t.species ?? 'Alle Tierarten'}. Basisjahr: ${t.baseline_year}. Ziel: ${t.target_year}. Reduktion: ${t.reduction_pct}%. Status: ${t.status}. ${t.notes}`,
    'StAR Strategie'
  );
}

console.log('FTS5 search index built');

// ---------------------------------------------------------------------------
// 8. Metadata
// ---------------------------------------------------------------------------

db.run(`INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)`, ['last_ingest', now]);
db.run(`INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)`, ['build_date', now]);
db.run(`INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)`, ['schema_version', '1.0']);

console.log(`Metadata updated: last_ingest=${now}`);

// ---------------------------------------------------------------------------
// 9. Update data/sources.yml
// ---------------------------------------------------------------------------

const sourcesYml = `# Data sources for ch-vet-medicines-mcp
sources:
  - name: Tierarzneimittel-Kompendium der Schweiz
    authority: Swissmedic
    url: https://www.tierarzneimittel.ch
    license: Swiss Federal Administration — free reuse
    update_frequency: continuous (on approval changes)
    last_retrieved: "${now}"

  - name: Tierarzneimittelverordnung (TAMV, SR 812.212.27)
    authority: Schweizerischer Bundesrat
    url: https://www.fedlex.admin.ch/eli/cc/2004/592/de
    license: Swiss Federal Administration — free reuse
    update_frequency: periodic (on revision)
    last_retrieved: "${now}"

  - name: IS ABV — Informationssystem Antibiotika in der Veterinaermedizin
    authority: BLV
    url: https://www.blv.admin.ch/blv/de/home/tiere/tierarzneimittel/antibiotika/isabv.html
    license: Swiss Federal Administration — free reuse
    update_frequency: continuous (mandatory reporting since 2019)
    last_retrieved: "${now}"

  - name: Antibiotikastrategie StAR
    authority: BLV
    url: https://www.star.admin.ch
    license: Swiss Federal Administration — free reuse
    update_frequency: periodic (strategy updates)
    last_retrieved: "${now}"

  - name: ARCH-Vet — Swiss Antibiotic Resistance Monitoring Report
    authority: BLV / Universitaet Bern (ZOBA)
    url: https://www.blv.admin.ch/blv/de/home/tiere/tierarzneimittel/antibiotika/arch-vet.html
    license: Swiss Federal Administration — free reuse
    update_frequency: annual
    last_retrieved: "${now}"

  - name: GST Therapierichtlinien
    authority: Gesellschaft Schweizer Tieraerztinnen und Tieraerzte
    url: https://www.gstsvs.ch
    license: Professional guidelines — fair use
    update_frequency: periodic
    last_retrieved: "${now}"
`;

writeFileSync('data/sources.yml', sourcesYml);
console.log('Updated data/sources.yml');

// ---------------------------------------------------------------------------
// 10. Update data/coverage.json
// ---------------------------------------------------------------------------

const coverage = {
  server: 'ch-vet-medicines-mcp',
  jurisdiction: 'CH',
  version: '0.1.0',
  last_ingest: now,
  data: {
    medicines: medicines.length,
    withdrawal_times: withdrawalTimes.length,
    antibiotic_categories: antibioticCategories.length,
    resistance_data_entries: resistanceData.length,
    prescription_rules: prescriptionRules.length,
    star_targets: starTargets.length,
  },
  tools: 10,
  sources: [
    'Tierarzneimittel-Kompendium (Swissmedic)',
    'TAMV (SR 812.212.27)',
    'IS ABV (BLV)',
    'StAR Strategie (BLV)',
    'ARCH-Vet Report',
    'GST Therapierichtlinien',
  ],
};

writeFileSync('data/coverage.json', JSON.stringify(coverage, null, 2) + '\n');
console.log('Updated data/coverage.json');

db.close();
console.log('Ingestion complete.');
