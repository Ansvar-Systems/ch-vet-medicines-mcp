export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Diese Daten dienen ausschliesslich der Information und ersetzen keine tieraerztliche Beratung. ' +
  'Vor jeder Anwendung von Tierarzneimitteln ist eine qualifizierte tieraerztliche Fachperson ' +
  'zu konsultieren. Die Daten basieren auf dem Tierarzneimittel-Kompendium (Swissmedic), der ' +
  'Tierarzneimittelverordnung (TAMV, SR 812.212.27), der Antibiotikastrategie StAR (BLV), dem ' +
  'IS ABV (Informationssystem Antibiotika in der Veterinaermedizin) und dem ARCH-Vet Bericht. ' +
  'Absetzfristen, Abgabekategorien und Resistenzdaten koennen sich aendern — massgebend ist ' +
  'stets die aktuelle Fachinformation von Swissmedic. / ' +
  'This data is provided for informational purposes only and does not replace veterinary advice. ' +
  'Always consult a qualified veterinarian before administering veterinary medicines. Data sourced ' +
  'from Swissmedic, TAMV, StAR strategy (BLV), IS ABV, and ARCH-Vet reports.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://www.tierarzneimittel.ch',
    copyright: 'Data: Swissmedic, BLV, ARCH-Vet — used under public-sector information principles. Server: Apache-2.0 Ansvar Systems.',
    server: 'ch-vet-medicines-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
