import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createDatabase, type Database } from './db.js';
import { handleAbout } from './tools/about.js';
import { handleListSources } from './tools/list-sources.js';
import { handleCheckFreshness } from './tools/check-freshness.js';
import { handleSearchMedicines } from './tools/search-medicines.js';
import { handleGetMedicineDetails } from './tools/get-medicine-details.js';
import { handleGetWithdrawalTimes } from './tools/get-withdrawal-times.js';
import { handleGetAntibioticCategories } from './tools/get-antibiotic-categories.js';
import { handleSearchResistanceData } from './tools/search-resistance-data.js';
import { handleGetPrescriptionRules } from './tools/get-prescription-rules.js';
import { handleGetStarTargets } from './tools/get-star-targets.js';

const SERVER_NAME = 'ch-vet-medicines-mcp';
const SERVER_VERSION = '0.1.0';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

const SearchMedicinesArgsSchema = z.object({
  query: z.string(),
  species: z.string().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const MedicineDetailsArgsSchema = z.object({
  medicine_id: z.string(),
  jurisdiction: z.string().optional(),
});

const WithdrawalArgsSchema = z.object({
  medicine_id: z.string().optional(),
  species: z.string().optional(),
  produce_type: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const AntibioticCategoriesArgsSchema = z.object({
  jurisdiction: z.string().optional(),
});

const ResistanceArgsSchema = z.object({
  query: z.string(),
  bacterium: z.string().optional(),
  antibiotic_class: z.string().optional(),
  species: z.string().optional(),
  jurisdiction: z.string().optional(),
  limit: z.number().optional(),
});

const PrescriptionRulesArgsSchema = z.object({
  medicine_category: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const StarTargetsArgsSchema = z.object({
  species: z.string().optional(),
  jurisdiction: z.string().optional(),
});

const TOOLS = [
  {
    name: 'about',
    description: 'Get server metadata: name, version, coverage, data sources, and links.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'list_sources',
    description: 'List all data sources with authority, URL, license, and freshness info.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'check_data_freshness',
    description: 'Check when data was last ingested, staleness status, and how to trigger a refresh.',
    inputSchema: { type: 'object' as const, properties: {} },
  },
  {
    name: 'search_medicines',
    description: 'Search Swiss veterinary medicines (Tierarzneimittel). Use for broad queries about medicines, active substances, or species.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Suchbegriff (Medikamentenname, Wirkstoff, oder Tierart)' },
        species: { type: 'string', description: 'Filter nach Tierart (z.B. Rind, Schwein, Gefluegel, Pferd)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_medicine_details',
    description: 'Get full profile for a veterinary medicine: active substance, target species, withdrawal times, Swissmedic number, dispensing category.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        medicine_id: { type: 'string', description: 'Medicine ID or name (z.B. amoxicillin-rind, cobactan)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
      required: ['medicine_id'],
    },
  },
  {
    name: 'get_withdrawal_times',
    description: 'Get withdrawal periods (Absetzfristen) for veterinary medicines. Filter by medicine, species, or produce type (Milch, Fleisch, Eier).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        medicine_id: { type: 'string', description: 'Medicine ID or name' },
        species: { type: 'string', description: 'Tierart (z.B. Rind, Schwein, Gefluegel)' },
        produce_type: { type: 'string', description: 'Lebensmitteltyp (Milch, Fleisch, Eier, Honig)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'get_antibiotic_categories',
    description: 'Get the Swiss Ampelsystem classification of antibiotics (gruen/gelb/rot) with restrictions and usage rules.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'search_resistance_data',
    description: 'Search ARCH-Vet antibiotic resistance monitoring data. Filter by bacterium, antibiotic class, or animal species.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Suchbegriff (Keim, Antibiotikum, Tierart)' },
        bacterium: { type: 'string', description: 'Filter nach Bakterium (z.B. E. coli, MRSA, Campylobacter)' },
        antibiotic_class: { type: 'string', description: 'Filter nach Antibiotikaklasse (z.B. Fluoroquinolone)' },
        species: { type: 'string', description: 'Filter nach Tierart' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
        limit: { type: 'number', description: 'Max results (default: 20, max: 50)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_prescription_rules',
    description: 'Get Swiss veterinary medicine dispensing rules: Abgabekategorien (A, B, D, E), Selbstdispensation, TAM-Vereinbarung, Behandlungsjournal.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        medicine_category: { type: 'string', description: 'Filter nach Kategorie (z.B. A, B, D, E, Selbstdispensation, Behandlungsjournal, Umwidmung)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
  {
    name: 'get_star_targets',
    description: 'Get StAR strategy (Strategie Antibiotikaresistenzen) reduction targets and progress for Swiss veterinary antibiotic use.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        species: { type: 'string', description: 'Filter nach Tierart (z.B. Schwein, Rind, Gefluegel)' },
        jurisdiction: { type: 'string', description: 'ISO 3166-1 alpha-2 code (default: CH)' },
      },
    },
  },
];

function textResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }], isError: true };
}

function registerTools(server: Server, db: Database): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      switch (name) {
        case 'about':
          return textResult(handleAbout());
        case 'list_sources':
          return textResult(handleListSources(db));
        case 'check_data_freshness':
          return textResult(handleCheckFreshness(db));
        case 'search_medicines':
          return textResult(handleSearchMedicines(db, SearchMedicinesArgsSchema.parse(args)));
        case 'get_medicine_details':
          return textResult(handleGetMedicineDetails(db, MedicineDetailsArgsSchema.parse(args)));
        case 'get_withdrawal_times':
          return textResult(handleGetWithdrawalTimes(db, WithdrawalArgsSchema.parse(args)));
        case 'get_antibiotic_categories':
          return textResult(handleGetAntibioticCategories(db, AntibioticCategoriesArgsSchema.parse(args)));
        case 'search_resistance_data':
          return textResult(handleSearchResistanceData(db, ResistanceArgsSchema.parse(args)));
        case 'get_prescription_rules':
          return textResult(handleGetPrescriptionRules(db, PrescriptionRulesArgsSchema.parse(args)));
        case 'get_star_targets':
          return textResult(handleGetStarTargets(db, StarTargetsArgsSchema.parse(args)));
        default:
          return errorResult(`Unknown tool: ${name}`);
      }
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  });
}

const db = createDatabase();
const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: Server }>();

function createMcpServer(): Server {
  const mcpServer = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} } }
  );
  registerTools(mcpServer, db);
  return mcpServer;
}

async function handleMCPRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
    return;
  }

  if (req.method === 'GET' || req.method === 'DELETE') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid or missing session ID' }));
    return;
  }

  const mcpServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  await mcpServer.connect(transport);

  transport.onclose = () => {
    if (transport.sessionId) {
      sessions.delete(transport.sessionId);
    }
    mcpServer.close().catch(() => {});
  };

  await transport.handleRequest(req, res);

  if (transport.sessionId) {
    sessions.set(transport.sessionId, { transport, server: mcpServer });
  }
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (url.pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', server: SERVER_NAME, version: SERVER_VERSION }));
    return;
  }

  if (url.pathname === '/mcp' || url.pathname === '/') {
    try {
      await handleMCPRequest(req, res);
    } catch (err) {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }));
      }
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

httpServer.listen(PORT, () => {
  console.log(`${SERVER_NAME} v${SERVER_VERSION} listening on port ${PORT}`);
});
