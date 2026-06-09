/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Preset requirements templates for instant high-fidelity execution
export const PRESET_TEMPLATES = [
  {
    name: "E-Commerce Multi-Channel Sales",
    description: "Multi-channel sales logs consolidation across custom web stores, Amazon sellers, and direct retail nodes for gross-to-net waterfall analytics.",
    text: "I run a high-volume multi-channel e-commerce brand. We capture sales logs across our custom Shopify online store, Amazon Sellers account, and direct retail. We need monthly analytics capturing gross-to-net sales waterfall, fulfillment speed, cart abandonment trends, and regional customer LTV."
  },
  {
    name: "Healthcare EHR Patient Ingest Pipeline",
    description: "Ingests electronic health record updates, tracking admission bottlenecks, staff assignment, clinical equipment waitlists, and GDPR compliance.",
    text: "Reviewing our hospital emergency care unit metrics. We ingest HL7/FIHR patient logs from multi-vendor clinics. We must analyze registration bottleneck SLA, bed-allocation intervals, active nurse assignment metrics, readmission risk metrics within 30 days, and guarantee GDPR compliance logs tracking."
  },
  {
    name: "IoT Predictive Maintenance & Fleet Logistics",
    description: "Consolidates telemetry patterns across global cargo vessels to alert mechanical failures, fuel yield anomalies, and geographic delay risks.",
    text: "Analyzing a global fleet of 150 logistics cargo ships. Each vessel transmits telemetric batches every 5 minutes (engine temperature, vibration index, RPM, fuel flow rate). We need to model anomalies to trigger predictive maintenance warnings, compute vessel fuel yield efficiency KPIs, and aggregate weather delays geographical indexes."
  },
  {
    name: "Fintech Micro-Lending Risk Engine",
    description: "Models portfolio indicators, capital-at-risk indexes, processing SLAs, and default risk trends by demographic cohorts.",
    text: "Our peer-to-peer micro-lending startup registers applications across multiple geos. We need normalized tabular schemas tracking application approval SLAs, credit rating variables, default correlation matrices across income cohorts, active portfolio indicators, and debt-to-income liquidity KPIs."
  }
];

// Pitch Deck Presentation structure
export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  focus: string;
  bullets: string[];
  azureAlloy: string;
}

export const PITCH_SLIDES: Slide[] = [
  {
    id: 1,
    title: "DataPilot AI",
    subtitle: "Enterprise Data Architectures & Analytics Pipelines Driven by Agentic Reasoning",
    focus: "The Hackathon Vision Statement",
    bullets: [
      "Translates natural business language requirements directly into physical PostgreSQL schemas, optimized DDL, and report queries.",
      "Recommends end-to-end cloud-native ETL topologies using modern Microsoft Fabric and OneLake Medallion architectures.",
      "Generates compile-ready Java Spring Boot JPA microservice configurations to eliminate developer onboarding bottlenecks.",
      "Powered by multi-agent cooperative workflows simulating specialized enterprise roles in a cohesive reasoning engine."
    ],
    azureAlloy: "Microsoft AI Foundry + Azure OpenAI Client Layer"
  },
  {
    id: 2,
    title: "The Problem & Market Gap",
    subtitle: "The Communication Chasm Between Business Scopes and Data Engineering Core",
    focus: "Data Bottleneck Realities",
    bullets: [
      "Unstructured business demands take weeks of back-and-forth alignment before turning into data-marts.",
      "Data architects design isolated tables without performance input, creating expensive SQL query blocks downstream.",
      "ETL developers construct pipelines disjointed from schema targets, prompting constant structural revisions.",
      "The median enterprise developer wastes 120+ hours bootstrapping basic controller/entity bindings for new operational schemas."
    ],
    azureAlloy: "AI Agents for Semantic Schema Synthesis"
  },
  {
    id: 3,
    title: "DataPilot AI's Cooperative Agent Mesh",
    subtitle: "Simulating Principal Professionals in a Synchronized Collaborative Pipeline",
    focus: "Agentic Roles & Handshakes",
    bullets: [
      "Agent 1: Requirement Analyst - Parses messy descriptions to structure goals, identify entities, map metric formulas, and establish logical restraints.",
      "Agent 2: Data Architect - Receives goal metadata and structures star-schema database nodes. Generates tables, column types, and relational foreign binds.",
      "Agent 3: SQL Engineer - Evaluates tables to draft high-performance reporting queries, window analytics, and index optimization guides.",
      "Agent 4: Pipeline Advisor - Deploys the Medallion landing-to-gold roadmap, selecting optimal Microsoft Fabric components (OneLake, DirectLake)."
    ],
    azureAlloy: "Sequential Agentic Reasoning Pipeline"
  },
  {
    id: 4,
    title: "Deep Microsoft Fabric Integration",
    subtitle: "Unifying Data Science, Enterprise Warehousing, and Live BI Engine Speeds",
    focus: "Next-Gen Microsoft Data Architecture",
    bullets: [
      "OneLake Gold Layer: Exposes Delta Parquet formats directly to serverless endpoints, cutting custom proprietary vendor silos.",
      "Fabric Notebooks: Schedules cluster-cleansing (PySpark Silver transformations) with zero infrastructure configuration overhead.",
      "DirectLake BI Semantic Model: Queries billion-row Delta maps directly from memories, bypassing classic Analysis Services refresh timers.",
      "Synapse Data Engineering: Schedules robust enterprise pipeline paths through Fabric Data Factory orchestration boards."
    ],
    azureAlloy: "Microsoft Fabric Lakehouse Blueprint"
  },
  {
    id: 5,
    title: "Production Spring Boot SDK Synthesis",
    subtitle: "Instantly Turn Architectural Blueprints into Compile-Ready Microservices",
    focus: "Dynamic Code Generation Core",
    bullets: [
      "Examines the Agent-designed schema to dynamically construct custom Spring Boot classes tailored to the business domain.",
      "Injects high-quality JPA entity mappings, primary key configurations, and proper database data types.",
      "Assembles standard CrudRepository layers, service boundaries, and robust API endpoints with Spring REST controls.",
      "Provides production DDL SQL scripts for quick provisioning inside managed PostgreSQL nodes."
    ],
    azureAlloy: "Agentic Code Gen & Compilation Support"
  }
];

// Development Roadmap
export const DEVELOPMENT_ROADMAP = [
  {
    phase: "Phase 1: Proof of Concept",
    timeline: "Days 1-2",
    status: "Completed",
    tasks: [
      "Map system prompts and JSON return interfaces for all 4 agents inside Microsoft AI Foundry playground.",
      "Bootstrap Express backend with Vite HMR client-side support.",
      "Construct file-persistence structures to capture historical prompt transactions."
    ]
  },
  {
    phase: "Phase 2: Agent Collaborations",
    timeline: "Days 3-4",
    status: "Completed",
    tasks: [
      "Implement sequential Multi-Agent execution pipeline, channeling state outputs as downstream prompts.",
      "Build dynamic Spring Boot code synthesis parser translating generic model schemas into robust java classes.",
      "Construct interactive Workbench interface capturing live processing feeds and reasoning notes."
    ]
  },
  {
    phase: "Phase 3: Integration & Polish",
    timeline: "Days 5-7 (Current)",
    status: "In Progress",
    tasks: [
      "Secure production deployments over Azure App Service with secure connection strings.",
      "Optimize CSS layout dimensions for real-time mobile/tablet inspection interfaces.",
      "Compile comprehensive pitch strategy and developer documentation workspace."
    ]
  }
];

// Judge Presentation Matrix
export const JUDGE_QNA = [
  {
    question: "How do the agents maintain consistency during the sequence?",
    answer: "Each downstream agent receives the cumulative output of previous layers. For example, the SQL Engineer doesn't just read the schema; it reads the initial business goals mapped by the Analyst and the table structures generated by the Data Architect together. This context-chaining guarantees high alignment."
  },
  {
    question: "Why was the combination of Spring Boot and Microsoft Fabric recommended?",
    answer: "Spring Boot represents the standard for high-performance operational transaction systems (OLTP) in the enterprise. Microsoft Fabric represents the absolute bleeding-edge for high-scale analytical workloads (OLAP). DataPilot AI unifies both: generating OLTP database schemas and code controllers, alongside the corresponding OLAP analytical ETL pipelines in OneLake."
  },
  {
    question: "What makes this agentic reasoning superior to a generic chat prompt?",
    answer: "A single generic prompt forces the model to solve distinct requirements simultaneously, often causing compromises in table normalization, missing index strategies, or generic ETL advice. By assigning isolated agent personas (Analyst, Architect, SQL Developer, Fabric Architect) with roles, and running them sequentially, we enforce critical discipline at each architecture layer."
  }
];

// MVP Scope vs Stretch Goals
export const SCOPE_MATRIX = {
  mvp: [
    "Complete natural language requirement analyzer.",
    "Dual-mode execution (Real Google GenAI LLM execution and Sandbox SimulatorFallback).",
    "4 intelligent cooperative business/database/ETL pipeline agents.",
    "Highly detailed SQL aggregations & Window query developers.",
    "Step-by-step reasoning explanations printed side-by-side on all screens.",
    "Dynamic Java Spring Boot boilerplate generator.",
    "Historical project catalogs for instant review."
  ],
  stretch: [
    "Live ER Diagram rendering using interactive schema node graphs.",
    "Automatic database migration deployment integrations via Flyway/Liquibase.",
    "Real-time database performance simulations comparing PostgreSQL B-Tree and Hash indexes.",
    "Azure Data Factory pipeline visual orchestrator integration."
  ]
};

// Demo Script
export interface DemoStep {
  stepNumber: number;
  title: string;
  action: string;
  say: string;
  verify: string;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: "Introduce DataPilot AI",
    action: "Show the landing workspace and historical catalog list on the left side menu.",
    say: "DataPilot AI closes the divide between business intent and technical physical infrastructure by using an agentic cooperative workforce. Here is our central dashboard tracking historical corporate projects.",
    verify: "Note how the active connection state indicates sandbox readiness, loading immediate default models."
  },
  {
    stepNumber: 2,
    title: "Deploy Preset Template",
    action: "Click on 'IoT Predictive Maintenance' or select a preset template on the dashboard, loading it into the workspace prompt box.",
    say: "Instead of writing complex technical data specifications manually, we select high-volume logistics requirements. When I initiate the cooperative agents, look closely at our header step tracker.",
    verify: "The timeline lights up as each agent loads, processes, and writes the output."
  },
  {
    stepNumber: 3,
    title: "Inspect Requirement Analysis",
    action: "Move to the 'Requirement Architect' workspace tab checking Goals, Entities, Metrics, and constraints.",
    say: "Our first agent maps out raw business requirements into precise goals, identifying core entities and mathematical formulas for metrics such as Response SLAs, and maps key physical constraints.",
    verify: "Each section includes explainable reasoning notes showing why these decisions were taken."
  },
  {
    stepNumber: 4,
    title: "Inspect Database Normalization",
    action: "Open the 'Schema Architect' tab. Scroll through the fact tables and dimension columns.",
    say: "The Schema agent consumes the analyst's goals and immediately designs a high-performance Star-Schema system. Columns have explicit types (UUID, NUMERIC, TIMESTAMP) and foreign reference joins are mapped cleanly.",
    verify: "The explainable reasoning highlights what normalization forms are achieved."
  },
  {
    stepNumber: 5,
    title: "Explain SQL Optimizations",
    action: "Open the 'SQL Engineer' tab and review the generated window analytics and copyable standard reporting blocks.",
    say: "Our SQL agent crafts production-ready aggregate reports and deep window trend indicators. It explicitly designs composite indexing recommendations to avoid complete sequential table scans.",
    verify: "Click 'Copy SQL' to mock physical deployments in Postgres, showcasing high integration capabilities."
  },
  {
    stepNumber: 6,
    title: "Microsoft Fabric Lakehouse Blueprint",
    action: "Open the 'Pipeline Advisor' tab inspecting Medallion steps (Bronze-Silver-Gold) and the specific Fabric configurations.",
    say: "To manage analytics, our Pipeline Agent recommends OneLake integrations. It models step-by-step transformations and suggests Power BI DirectLake parameters to query Delta Parquet storage models without memory refresh lag.",
    verify: "The detailed Fabric Recommendation provides ready-to-use blueprints for enterprise-grade Lakehouse setups."
  },
  {
    stepNumber: 7,
    title: "dynamic java sdk synthesis",
    action: "Open the 'Spring Boot SDK' tab. Expand the file explorer, selecting Controller, Entity, and Service files.",
    say: "Finally, DataPilot AI synthesizes a compile-ready Java Spring Boot JPA microservice specifically mapped to this dynamic schema. It features repositories, controllers, entities, and Postgres DDL files instantly ready to deploy.",
    verify: "Each file highlights standard clean enterprise coding conventions with detailed descriptive titles."
  }
];
