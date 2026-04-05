import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Switzerland Veterinary Medicines MCP',
    description:
      'Swiss veterinary medicine data based on the Tierarzneimittel-Kompendium (Swissmedic), ' +
      'Tierarzneimittelverordnung (TAMV), Antibiotikastrategie StAR (BLV), IS ABV reporting data, ' +
      'and ARCH-Vet resistance monitoring. Provides medicine search, withdrawal times (Absetzfristen), ' +
      'antibiotic Ampelsystem classification, prescription and dispensing rules (Abgabekategorien, ' +
      'Selbstdispensation), antibiotic resistance trends, and StAR strategy targets.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Tierarzneimittel-Kompendium (Swissmedic)',
      'Tierarzneimittelverordnung TAMV (SR 812.212.27)',
      'Antibiotikastrategie StAR (BLV)',
      'IS ABV — Informationssystem Antibiotika in der Veterinaermedizin',
      'ARCH-Vet Report (jaehrlich)',
      'GST Therapierichtlinien',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/ch-vet-medicines-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
