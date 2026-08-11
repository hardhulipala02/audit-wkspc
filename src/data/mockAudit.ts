export type AgentStepType =
  | "tool_call"
  | "reasoning"
  | "redline_proposal"
  | "summary";

export type AgentStepStatus = "success" | "error" | "running" | "pending";

export type JsonSchemaPropertyType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object";

export interface JsonSchemaProperty {
  type: JsonSchemaPropertyType;
  description?: string;
  enum?: string[];
  items?: { type: JsonSchemaPropertyType };
}

export interface ToolCallDetails {
  requestId: string;
  server: string;
  toolName: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, JsonSchemaProperty>;
    required: string[];
  };
  arguments: Record<string, unknown>;
  result: unknown;
  status: "success" | "error";
  latencyMs: number;
  startedAt: string;
  completedAt: string;
}

export interface AgentStep {
  id: string;
  index: number;
  type: AgentStepType;
  status: AgentStepStatus;
  agent: string;
  title: string;
  thought?: string;
  toolCall?: ToolCallDetails;
  redlineIds?: string[];
  timestamp: string;
  durationMs: number;
}

export type RedlineSeverity = "critical" | "high" | "medium" | "low";

export type RedlineCategory =
  | "liability"
  | "indemnification"
  | "termination"
  | "confidentiality"
  | "intellectual-property"
  | "data-protection"
  | "governing-law"
  | "payment-terms";

export type RedlineStatus = "pending" | "accepted" | "rejected" | "needs-review";

export interface Redline {
  id: string;
  clauseSection: string;
  clauseTitle: string;
  category: RedlineCategory;
  severity: RedlineSeverity;
  status: RedlineStatus;
  originalText: string;
  suggestedText: string;
  rationale: string;
  playbookReference?: string;
  agentStepId: string;
}

export const mockContractMeta = {
  contractId: "ctr_9f2a1b7c",
  title: "Master Services Agreement",
  counterparty: "Northwind Logistics, Inc.",
  effectiveDate: "2026-09-01",
  reviewer: "contracts-review-agent",
  playbookVersion: "playbook-v4.2-vendor-msa",
};

export const mockRedlines: Redline[] = [
  {
    id: "rl_liability_cap",
    clauseSection: "8.1",
    clauseTitle: "Limitation of Liability",
    category: "liability",
    severity: "critical",
    status: "pending",
    originalText:
      "IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY UNDER THIS AGREEMENT EXCEED THE FEES PAID BY CUSTOMER IN THE ONE (1) MONTH PRIOR TO THE EVENT GIVING RISE TO THE CLAIM.",
    suggestedText:
      "IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY UNDER THIS AGREEMENT EXCEED THE FEES PAID BY CUSTOMER IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO THE CLAIM, EXCEPT THAT SUCH CAP SHALL NOT APPLY TO BREACHES OF SECTION 9 (CONFIDENTIALITY) OR CLAIMS ARISING FROM A PARTY'S GROSS NEGLIGENCE OR WILLFUL MISCONDUCT.",
    rationale:
      "A one-month liability cap is well below the playbook floor of a trailing 12-month cap and leaves no carve-out for confidentiality breaches or willful misconduct, which is standard in comparable vendor MSAs.",
    playbookReference: "playbook-v4.2-vendor-msa#liability-cap-floor",
    agentStepId: "step_5",
  },
  {
    id: "rl_indemnification_scope",
    clauseSection: "9.3",
    clauseTitle: "Indemnification by Vendor",
    category: "indemnification",
    severity: "high",
    status: "pending",
    originalText:
      "Vendor shall indemnify Customer against third-party claims arising solely from Vendor's breach of Section 7 (Confidentiality).",
    suggestedText:
      "Vendor shall indemnify, defend, and hold harmless Customer against third-party claims arising from (a) Vendor's breach of Section 7 (Confidentiality), (b) Vendor's infringement of a third party's intellectual property rights, or (c) Vendor's gross negligence or willful misconduct.",
    rationale:
      "Current scope is limited to confidentiality breaches only and omits IP infringement indemnification, which is a required baseline protection under the vendor playbook.",
    playbookReference: "playbook-v4.2-vendor-msa#indemnification-baseline",
    agentStepId: "step_5",
  },
  {
    id: "rl_auto_renewal_notice",
    clauseSection: "12.2",
    clauseTitle: "Term and Auto-Renewal",
    category: "termination",
    severity: "medium",
    status: "pending",
    originalText:
      "This Agreement shall automatically renew for successive one (1) year terms unless either party provides written notice of non-renewal at least fifteen (15) days prior to the end of the then-current term.",
    suggestedText:
      "This Agreement shall automatically renew for successive one (1) year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.",
    rationale:
      "A 15-day non-renewal notice window is too short for Customer's procurement cycle and increases the risk of an unintended renewal; the playbook default is 60 days.",
    playbookReference: "playbook-v4.2-vendor-msa#renewal-notice-window",
    agentStepId: "step_5",
  },
  {
    id: "rl_governing_law_venue",
    clauseSection: "15.4",
    clauseTitle: "Governing Law and Venue",
    category: "governing-law",
    severity: "medium",
    status: "needs-review",
    originalText:
      "This Agreement shall be governed by the laws of the State of Delaware, and the parties consent to the exclusive jurisdiction of the state and federal courts located in New Castle County, Delaware.",
    suggestedText:
      "This Agreement shall be governed by the laws of the State of New York, and the parties consent to the exclusive jurisdiction of the state and federal courts located in New York County, New York.",
    rationale:
      "Customer's standard playbook prefers New York governing law and venue for enforceability consistency with its other vendor contracts; flagged for legal team confirmation since Vendor may push back.",
    playbookReference: "playbook-v4.2-vendor-msa#preferred-venue",
    agentStepId: "step_5",
  },
  {
    id: "rl_subprocessor_flowdown",
    clauseSection: "10.6",
    clauseTitle: "Data Protection - Sub-processors",
    category: "data-protection",
    severity: "high",
    status: "pending",
    originalText:
      "Vendor may engage sub-processors to perform its obligations under this Agreement without prior notice to Customer.",
    suggestedText:
      "Vendor may engage sub-processors to perform its obligations under this Agreement provided that Vendor (a) maintains an up-to-date list of sub-processors available to Customer, (b) provides at least thirty (30) days' prior written notice of any new sub-processor, and (c) remains fully liable for the acts and omissions of its sub-processors as if performed by Vendor.",
    rationale:
      "Unrestricted sub-processor engagement without notice or flow-down liability fails the data protection addendum baseline and creates unmanaged downstream data risk.",
    playbookReference: "playbook-v4.2-vendor-msa#subprocessor-notice",
    agentStepId: "step_5",
  },
  {
    id: "rl_ip_assignment_carveout",
    clauseSection: "11.1",
    clauseTitle: "Intellectual Property Ownership",
    category: "intellectual-property",
    severity: "low",
    status: "pending",
    originalText:
      "All work product created by Vendor in connection with this Agreement shall be owned exclusively by Vendor.",
    suggestedText:
      "All work product created by Vendor specifically for Customer under a Statement of Work shall be owned exclusively by Customer, excluding Vendor's pre-existing tools, methodologies, and general know-how, which Vendor may retain and reuse.",
    rationale:
      "Blanket vendor ownership of all work product conflicts with Customer's standard requirement to own deliverables created specifically for it under a SOW.",
    playbookReference: "playbook-v4.2-vendor-msa#ip-deliverable-ownership",
    agentStepId: "step_5",
  },
];

export const mockAgentSteps: AgentStep[] = [
  {
    id: "step_1",
    index: 1,
    type: "tool_call",
    status: "success",
    agent: "contracts-review-agent",
    title: "Fetch contract source document",
    thought:
      "Need the authoritative executed draft before segmenting clauses; pulling from the connected e-signature workspace rather than the emailed attachment.",
    toolCall: {
      requestId: "req_001a",
      server: "docusign-connector",
      toolName: "mcp__docusign-connector__fetch_envelope_document",
      description:
        "Fetches a document (PDF or DOCX) from a DocuSign envelope by envelope and document ID.",
      inputSchema: {
        type: "object",
        properties: {
          envelopeId: { type: "string", description: "DocuSign envelope identifier." },
          documentId: { type: "string", description: "Document identifier within the envelope." },
          format: { type: "string", enum: ["pdf", "docx"], description: "Desired output format." },
        },
        required: ["envelopeId", "documentId"],
      },
      arguments: {
        envelopeId: "env_7d3f9c21",
        documentId: "1",
        format: "docx",
      },
      result: {
        fileName: "Northwind_MSA_v3_redline.docx",
        sizeBytes: 184320,
        pageCount: 22,
        storageUri: "s3://audit-workspace/contracts/ctr_9f2a1b7c/source.docx",
      },
      status: "success",
      latencyMs: 842,
      startedAt: "2026-08-11T14:02:01.114Z",
      completedAt: "2026-08-11T14:02:01.956Z",
    },
    timestamp: "2026-08-11T14:02:01.114Z",
    durationMs: 842,
  },
  {
    id: "step_2",
    index: 2,
    type: "tool_call",
    status: "success",
    agent: "contracts-review-agent",
    title: "Segment document into clauses",
    thought:
      "Segmenting by numbered section headers so downstream tools can address individual clauses instead of the full document.",
    toolCall: {
      requestId: "req_002a",
      server: "document-parser",
      toolName: "mcp__document-parser__segment_clauses",
      description:
        "Parses a legal document and returns a structured list of clauses keyed by section number and heading.",
      inputSchema: {
        type: "object",
        properties: {
          storageUri: { type: "string", description: "URI of the source document to parse." },
          documentType: {
            type: "string",
            enum: ["msa", "nda", "sow", "dpa", "other"],
            description: "Hint for the parser's section-heading heuristics.",
          },
        },
        required: ["storageUri"],
      },
      arguments: {
        storageUri: "s3://audit-workspace/contracts/ctr_9f2a1b7c/source.docx",
        documentType: "msa",
      },
      result: {
        clauseCount: 47,
        sections: [
          "1. Definitions",
          "7. Confidentiality",
          "8. Limitation of Liability",
          "9. Indemnification",
          "10. Data Protection",
          "11. Intellectual Property",
          "12. Term and Termination",
          "15. Governing Law",
        ],
      },
      status: "success",
      latencyMs: 1310,
      startedAt: "2026-08-11T14:02:02.201Z",
      completedAt: "2026-08-11T14:02:03.511Z",
    },
    timestamp: "2026-08-11T14:02:02.201Z",
    durationMs: 1310,
  },
  {
    id: "step_3",
    index: 3,
    type: "reasoning",
    status: "success",
    agent: "contracts-review-agent",
    title: "Triage clauses for playbook risk review",
    thought:
      "Liability, indemnification, termination, governing law, data protection, and IP assignment are the clauses most likely to deviate from playbook-v4.2-vendor-msa based on prior review patterns. Deprioritizing boilerplate sections (notices, severability, entire agreement) that rarely carry negotiated risk.",
    timestamp: "2026-08-11T14:02:04.002Z",
    durationMs: 96,
  },
  {
    id: "step_4",
    index: 4,
    type: "tool_call",
    status: "success",
    agent: "contracts-review-agent",
    title: "Look up playbook policy for flagged clauses",
    thought:
      "Retrieving the approved fallback language and negotiation floors for each flagged clause before scoring deviation.",
    toolCall: {
      requestId: "req_004a",
      server: "playbook-engine",
      toolName: "mcp__playbook-engine__lookup_policy",
      description:
        "Returns the approved position, fallback language, and negotiation floor for a given clause category from the active playbook.",
      inputSchema: {
        type: "object",
        properties: {
          playbookVersion: { type: "string", description: "Playbook version identifier." },
          categories: {
            type: "array",
            items: { type: "string" },
            description: "Clause categories to look up.",
          },
        },
        required: ["playbookVersion", "categories"],
      },
      arguments: {
        playbookVersion: "playbook-v4.2-vendor-msa",
        categories: [
          "liability",
          "indemnification",
          "termination",
          "governing-law",
          "data-protection",
          "intellectual-property",
        ],
      },
      result: {
        policies: [
          { category: "liability", floor: "12-month trailing fees cap, carve-outs for confidentiality and willful misconduct" },
          { category: "indemnification", floor: "IP infringement + confidentiality + gross negligence coverage required" },
          { category: "termination", floor: "60-day non-renewal notice minimum" },
          { category: "governing-law", floor: "New York preferred, Delaware acceptable with legal sign-off" },
          { category: "data-protection", floor: "30-day sub-processor notice with flow-down liability" },
          { category: "intellectual-property", floor: "Customer owns SOW-specific deliverables" },
        ],
      },
      status: "success",
      latencyMs: 415,
      startedAt: "2026-08-11T14:02:04.301Z",
      completedAt: "2026-08-11T14:02:04.716Z",
    },
    timestamp: "2026-08-11T14:02:04.301Z",
    durationMs: 415,
  },
  {
    id: "step_5",
    index: 5,
    type: "redline_proposal",
    status: "success",
    agent: "contracts-review-agent",
    title: "Draft redlines for flagged clauses",
    thought:
      "Generating suggested replacement language for each clause that falls short of the playbook floor, with rationale citing the specific policy deviation.",
    toolCall: {
      requestId: "req_005a",
      server: "redline-generator",
      toolName: "mcp__redline-generator__draft_redline",
      description:
        "Given original clause text and a target policy floor, drafts suggested replacement language and a rationale for the deviation.",
      inputSchema: {
        type: "object",
        properties: {
          clauseSection: { type: "string", description: "Section number of the clause being redlined." },
          originalText: { type: "string", description: "Verbatim text of the clause as currently drafted." },
          policyFloor: { type: "string", description: "The playbook's minimum acceptable position for this clause category." },
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
            description: "Assessed risk severity of the deviation.",
          },
        },
        required: ["clauseSection", "originalText", "policyFloor", "severity"],
      },
      arguments: {
        clauseSections: ["8.1", "9.3", "12.2", "15.4", "10.6", "11.1"],
        policyVersion: "playbook-v4.2-vendor-msa",
      },
      result: {
        redlinesGenerated: 6,
        redlineIds: [
          "rl_liability_cap",
          "rl_indemnification_scope",
          "rl_auto_renewal_notice",
          "rl_governing_law_venue",
          "rl_subprocessor_flowdown",
          "rl_ip_assignment_carveout",
        ],
      },
      status: "success",
      latencyMs: 2894,
      startedAt: "2026-08-11T14:02:05.020Z",
      completedAt: "2026-08-11T14:02:07.914Z",
    },
    redlineIds: [
      "rl_liability_cap",
      "rl_indemnification_scope",
      "rl_auto_renewal_notice",
      "rl_governing_law_venue",
      "rl_subprocessor_flowdown",
      "rl_ip_assignment_carveout",
    ],
    timestamp: "2026-08-11T14:02:05.020Z",
    durationMs: 2894,
  },
  {
    id: "step_6",
    index: 6,
    type: "tool_call",
    status: "error",
    agent: "contracts-review-agent",
    title: "Cross-check counterparty entity against sanctions list",
    thought:
      "Running a standard compliance check on the counterparty entity before finalizing the review; the screening service timed out and will need a retry outside this pass.",
    toolCall: {
      requestId: "req_006a",
      server: "compliance-screening",
      toolName: "mcp__compliance-screening__screen_entity",
      description:
        "Screens a legal entity name against sanctions, watchlist, and adverse-media sources.",
      inputSchema: {
        type: "object",
        properties: {
          entityName: { type: "string", description: "Legal name of the entity to screen." },
          jurisdiction: { type: "string", description: "ISO country code of the entity's primary jurisdiction." },
        },
        required: ["entityName"],
      },
      arguments: {
        entityName: "Northwind Logistics, Inc.",
        jurisdiction: "US",
      },
      result: {
        error: "GatewayTimeout",
        message: "Screening provider did not respond within 8000ms.",
      },
      status: "error",
      latencyMs: 8021,
      startedAt: "2026-08-11T14:02:08.100Z",
      completedAt: "2026-08-11T14:02:16.121Z",
    },
    timestamp: "2026-08-11T14:02:08.100Z",
    durationMs: 8021,
  },
  {
    id: "step_7",
    index: 7,
    type: "summary",
    status: "success",
    agent: "contracts-review-agent",
    title: "Summarize review pass",
    thought:
      "Six redlines proposed across liability, indemnification, termination, governing law, data protection, and IP; one critical (liability cap). Sanctions screening failed and should be re-run before final sign-off.",
    redlineIds: [
      "rl_liability_cap",
      "rl_indemnification_scope",
      "rl_auto_renewal_notice",
      "rl_governing_law_venue",
      "rl_subprocessor_flowdown",
      "rl_ip_assignment_carveout",
    ],
    timestamp: "2026-08-11T14:02:16.400Z",
    durationMs: 58,
  },
];

export const mockAudit = {
  meta: mockContractMeta,
  steps: mockAgentSteps,
  redlines: mockRedlines,
};
