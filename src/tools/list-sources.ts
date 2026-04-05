import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Tierarzneimittel-Kompendium der Schweiz',
      authority: 'Swissmedic',
      official_url: 'https://www.tierarzneimittel.ch',
      retrieval_method: 'REFERENCE_DATA',
      update_frequency: 'continuous (Swissmedic updates on approval changes)',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Zugelassene Tierarzneimittel: Zulassungsnummer, Wirkstoff, Zieltiere, Absetzfristen',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Tierarzneimittelverordnung (TAMV, SR 812.212.27)',
      authority: 'Schweizerischer Bundesrat',
      official_url: 'https://www.fedlex.admin.ch/eli/cc/2004/592/de',
      retrieval_method: 'LEGAL_TEXT',
      update_frequency: 'periodic (on revision)',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Abgabekategorien, Verschreibungsregeln, Umwidmung, Behandlungsjournal',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'IS ABV — Informationssystem Antibiotika in der Veterinaermedizin',
      authority: 'Bundesamt fuer Lebensmittelsicherheit und Veterinaerwesen (BLV)',
      official_url: 'https://www.blv.admin.ch/blv/de/home/tiere/tierarzneimittel/antibiotika/isabv.html',
      retrieval_method: 'REFERENCE_DATA',
      update_frequency: 'continuous (mandatory reporting since 2019)',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Obligatorische Meldung aller Antibiotikaverschreibungen, Verbrauchsdaten pro Betrieb',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'Antibiotikastrategie StAR',
      authority: 'Bundesamt fuer Lebensmittelsicherheit und Veterinaerwesen (BLV)',
      official_url: 'https://www.star.admin.ch',
      retrieval_method: 'REFERENCE_DATA',
      update_frequency: 'periodic (strategy updates)',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Reduktionsziele, Massnahmen Tierhaltung, kritisch wichtige Antibiotika',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'ARCH-Vet — Swiss Antibiotic Resistance Monitoring Report',
      authority: 'BLV / Universitaet Bern (ZOBA)',
      official_url: 'https://www.blv.admin.ch/blv/de/home/tiere/tierarzneimittel/antibiotika/arch-vet.html',
      retrieval_method: 'REPORT_EXTRACT',
      update_frequency: 'annual',
      license: 'Swiss Federal Administration — free reuse',
      coverage: 'Resistenzraten nach Tierart, Keim und Antibiotikum — jaehrliche Trends',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'GST Therapierichtlinien',
      authority: 'Gesellschaft Schweizer Tieraerztinnen und Tieraerzte (GST)',
      official_url: 'https://www.gstsvs.ch',
      retrieval_method: 'REFERENCE_DATA',
      update_frequency: 'periodic',
      license: 'Professional guidelines — fair use for reference',
      coverage: 'Therapieempfehlungen, Antibiotikaeinsatz-Richtlinien',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta(),
  };
}
