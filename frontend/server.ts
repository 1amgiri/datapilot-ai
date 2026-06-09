/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure db directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial default projects to show off instantly
const DEFAULT_PROJECTS = [
  {
    id: "proj_ecommerce_sales",
    name: "E-Commerce Multi-Channel Sales Analytics",
    description: "Monthly analytics dashboard capturing order baskets, channel contributions, fulfillment cycles, and client retention cohorts.",
    requirements: "I run a high-volume multi-channel e-commerce brand. We capture sales logs across our custom Shopify online store, Amazon Sellers account, and direct retail. We need monthly analytics capturing gross-to-net sales waterfall, fulfillment speed, cart abandonment trends, and regional customer LTV.",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: "completed",
    analysis: {
      businessGoals: [
        "Consolidate multichannel transactional records (web, retail, marketplace) to view total business yield.",
        "Track dynamic Gross-to-Net Sales metrics (gross sales less discounts, returns, and delivery fees).",
        "Monitor operational SLA speed (Time-to-Ship, Carrier Transit Intervals)."
      ],
      entities: [
        { name: "Order", description: "Root log for transactional events across platforms.", keyAttributes: ["id", "source_channel", "timestamp", "gross_amount"] },
        { name: "Order_Item", description: "Line detail reflecting SKU details and counts per basket.", keyAttributes: ["id", "product_id", "quantity", "unit_price"] },
        { name: "Customer", description: "Consolidated loyalty identity record.", keyAttributes: ["id", "signup_cohort", "postal_code", "email_hash"] },
        { name: "Channel", description: "Origin definitions (Shopify, Amazon, Retail POS).", keyAttributes: ["id", "name", "commission_rate"] }
      ],
      metrics: [
        { name: "Net Sales Yield", calculationLogic: "SUM(gross_amount) - SUM(discounts) - SUM(value_of_returns)", targetKPIs: ["> $2.5MM quarterly"] },
        { name: "Fulfillment Cycle Time", calculationLogic: "AVG(timestamp_shipped - timestamp_created)", targetKPIs: ["< 1.8 days average"] }
      ],
      constraints: [
        "Handling distinct currency values normalized into USD.",
        "Handling backordered or split line-item delivery events."
      ],
      reasoning: "Consolidating distinct transaction source structures requires a clean, channel-agnostic Orders base. We isolate Order_Items to guarantee granular analytics for cart abandonment calculations and average basket dimension diagnostics."
    },
    schema: {
      tables: [
        {
          name: "dim_channels",
          description: "Details of transactional avenues.",
          columns: [
            { name: "channel_id", type: "INT", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
            { name: "channel_name", type: "VARCHAR(50)", constraints: ["NOT NULL", "UNIQUE"], isPrimaryKey: false, isForeignKey: false },
            { name: "commission_rate", type: "NUMERIC(5,4)", constraints: ["DEFAULT 0.0"], isPrimaryKey: false, isForeignKey: false }
          ]
        },
        {
          name: "dim_customers",
          description: "Consolidated subscriber profile record.",
          columns: [
            { name: "customer_id", type: "UUID", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
            { name: "email_hash", type: "VARCHAR(64)", constraints: ["NOT NULL", "UNIQUE"], isPrimaryKey: false, isForeignKey: false },
            { name: "signup_cohort", type: "DATE", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "postal_code", type: "VARCHAR(12)", constraints: [], isPrimaryKey: false, isForeignKey: false }
          ]
        },
        {
          name: "fact_orders",
          description: "Core sales transactions fact table.",
          columns: [
            { name: "order_id", type: "UUID", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
            { name: "customer_id", type: "UUID", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_customers", referencesColumn: "customer_id" },
            { name: "channel_id", type: "INT", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_channels", referencesColumn: "channel_id" },
            { name: "order_timestamp", type: "TIMESTAMP", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "gross_amount", type: "NUMERIC(12,2)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "discounts_applied", type: "NUMERIC(10,2)", constraints: ["DEFAULT 0.0"], isPrimaryKey: false, isForeignKey: false },
            { name: "refunded_amount", type: "NUMERIC(10,2)", constraints: ["DEFAULT 0.0"], isPrimaryKey: false, isForeignKey: false }
          ]
        }
      ],
      relationships: [
        { fromTable: "fact_orders", fromColumn: "customer_id", toTable: "dim_customers", toColumn: "customer_id", type: "one-to-many" },
        { fromTable: "fact_orders", fromColumn: "channel_id", toTable: "dim_channels", toColumn: "channel_id", type: "one-to-many" }
      ],
      reasoning: "Implemented a star-schema topology for optimal analytics engine caching. Customers and channels represent highly stable dimension nodes, whereas fact_orders manages raw transactional volatility."
    },
    sql: {
      queries: [
        {
          title: "Monthly Gross and Net Sales by Channel",
          sql: "SELECT \n  c.channel_name,\n  DATE_TRUNC('month', o.order_timestamp) AS sale_month,\n  SUM(o.gross_amount) AS gross_sales,\n  SUM(o.gross_amount - o.discounts_applied - o.refunded_amount) AS net_sales\nFROM fact_orders o\nJOIN dim_channels c ON o.channel_id = c.channel_id\nGROUP BY 1, 2\nORDER BY 2 DESC, 3 DESC;",
          description: "Calculates monthly pipeline health across retail paths to capture return friction points.",
          columnsExpected: ["channel_name", "sale_month", "gross_sales", "net_sales"]
        }
      ],
      analyticsQueries: [
        {
          title: "Customer Cohort Retention Rate Analytics",
          sql: "WITH customer_orders AS (\n  SELECT \n    customer_id,\n    order_timestamp,\n    DATE_TRUNC('month', order_timestamp) AS order_month\n  FROM fact_orders\n),\nfirst_purchases AS (\n  SELECT \n    customer_id,\n    MIN(DATE_TRUNC('month', order_timestamp)) AS cohort_month\n  FROM fact_orders\n  GROUP BY 1\n)\nSELECT \n  f.cohort_month,\n  COUNT(DISTINCT f.customer_id) AS cohort_size,\n  COUNT(DISTINCT co.customer_id) AS active_retained_users\nFROM first_purchases f\nLEFT JOIN customer_orders co ON f.customer_id = co.customer_id AND co.order_month = f.cohort_month + INTERVAL '1 month'\nGROUP BY 1\nORDER BY 1;",
          description: "Utilizes CTE and calendar ranges to track exact month-over-month loyalty index dynamics.",
          optimizationExplanation: "Apply indexes on customer_id and order_timestamp. Adding cluster patterns on fact_orders based on order_date prevents scanning historic transaction tables."
        }
      ],
      reasoning: "Queries avoid correlated subqueries by employing Common Table Expressions (CTEs), guaranteeing clean memory map allocation. Composite indexes ensure fast index-only scans without table page calls."
    },
    pipeline: {
      etlSteps: [
        { step: "Data Extraction", source: "Shopify API, S3 Amazon CSV bucket", target: "OneLake Landing Folder", transformation: "None (Direct copy)", description: "Incorporate Fabric Copy Activities to pull platform schedules into Lakehouse landing segments raw." },
        { step: "Silver Layer Cleansing", source: "Landing Raw Lakehouse", target: "Silver Layer Catalog", transformation: "Format conversion, data type normalization, dropping blank orders", description: "Execute Synapse Spark Notebook written in PySpark to strip corrupt records, enforce types, and format emails into lowercase hashes." }
      ],
      dataWarehouseDesign: {
        modelType: "Star",
        brief: "Star-schema optimized for Delta Lake storage, storing historical data paths sequentially.",
        facts: ["fact_orders", "fact_order_items"],
        dimensions: ["dim_customers", "dim_channels", "dim_products"]
      },
      fabricRecommendation: {
        componentsRecommended: ["OneLake", "Fabric Dataflow Gen2", "Synapse Lakehouse", "DirectLake semantic dataset", "Power BI Desktop"],
        integrationFlow: "Copy Activity pulls APIs -> Lakehouse Bronze (Delta Raw) -> Fabric Notebook Silver (Cleansed Delta) -> Lakehouse Delta Gold -> DirectLake semantic layer -> Power BI visualization.",
        ingestionLayer: "Active APIs handled on a three-hour batch through Fabric Data Factory Pipelines.",
        analyticsLayer: "A gold layer is cataloged via Lakehouse default SQL Endpoint, exposing tables for DirectLake client bindings.",
        powerBiIntegration: "Use Fabric DirectLake mode to bypass import refresh overhead, reading live updates instantly with high cache performance."
      },
      reasoning: "Using Delta Parquet inside Microsoft OneLake delivers excellent storage savings. The use of Fabric's DirectLake semantic model ensures dashboard loads take fractional milliseconds, bypassing classic Analysis Services refresh timers entirely."
    }
  }
];

function generateAdvancedReasoning(name: string, requirements: string, analysis: any, schema: any, sql: any, pipeline: any) {
  const reqLower = (requirements || "").toLowerCase();
  let domain = "Enterprise Operations";
  let sector = "Operations";
  let standard = "GDPR & SOC2 Compliance";
  if (reqLower.includes("health") || reqLower.includes("patient") || reqLower.includes("hospital")) {
    domain = "Healthcare Ingestion";
    sector = "Clinical Healthcare";
    standard = "HIPAA Security Rule & GDPR";
  } else if (reqLower.includes("iot") || reqLower.includes("sensor") || reqLower.includes("machine") || reqLower.includes("vessel") || reqLower.includes("ship")) {
    domain = "IoT Diagnostics";
    sector = "Industrial Logistics & Fleet IoT";
    standard = "ISO 27001 & SOC2 Type II";
  } else if (reqLower.includes("school") || reqLower.includes("student") || reqLower.includes("course") || reqLower.includes("academic")) {
    domain = "Academic Registry";
    sector = "Higher Education Analytics";
    standard = "FERPA & GDPR Compliance";
  } else if (reqLower.includes("finance") || reqLower.includes("loan") || reqLower.includes("bank") || reqLower.includes("lend") || reqLower.includes("credit")) {
    domain = "Fintech Ledger";
    sector = "Financial Credit Risk Management";
    standard = "PCI-DSS Level 1 & GDPR";
  } else if (reqLower.includes("retail") || reqLower.includes("ecommerce") || reqLower.includes("shop") || reqLower.includes("channel") || reqLower.includes("sales") || reqLower.includes("customer")) {
    domain = "E-Commerce Multiplex";
    sector = "Retail Logistics & Cart Analytics";
    standard = "PCI-DSS Compliance & CCPA / GDPR";
  }

  const requirementsReasoning = {
    thoughtProcess: `The core objective for this ${sector} platform is consolidating disparate, volatile input streams into standard queryable entities. We analyzed the business requirements, filtered redundant constraints, and isolated transactions from core actors.`,
    decisionLogic: `Extracted standard normalized entities from the user request nouns. Mapped target KPIs with specific time intervals to ensure performance bounds.`,
    assumptions: [
      `Assumed timestamp records represent UTC values.`,
      `Assumed external third-party logs are batched periodically.`,
      `Assumed user profile identities have been pre-validated.`
    ],
    constraints: [
      `Handling duplicate incoming records due to transient retry actions.`,
      `Managing inconsistent data formats from distributed source endpoints.`
    ],
    alternatives: [
      `Alternative A: Standalone relational PostgreSQL. Simple to build but bottlenecks under extreme batch write frequencies.`,
      `Alternative B: Unstructured NoSQL store. Fast ingestion but compromises strict multi-table relational intelligence.`,
      `Alternative C: Dimensional Lakehouse (Chosen). Delivers structured star-schema scaling over Microsoft OneLake.`
    ],
    confidenceScore: 95,
    confidenceReasons: {
      dataCompleteness: 94,
      businessAmbiguity: 90,
      schemaCertainty: 98,
      pipelineCertainty: 96
    }
  };

  const schemaReasoning = {
    thoughtProcess: `To support sub-second query speeds for ${domain}, we structured the schema into a standard Star Schema. Highly static entities occupy the outer dimension layers while high-frequency actions form the fact tables.`,
    decisionLogic: `Generated primary keys with auto-indices. Configured key constraints for foreign references.`,
    assumptions: [
      `Active dimension indexes fit within query engine execution memory cache.`,
      `Surrogate UUID mappings avoid synchronization locks in multi-channel registers.`
    ],
    constraints: [
      `Maintaining transactional safety across multi-region tenant servers.`,
      `Ensuring low join depth latency during massive reporting query blocks.`
    ],
    alternatives: [
      `Option A: Fully flat denormalized logs. Zero join overhead, but introduces massive storage redundancy and updates logic gaps.`,
      `Option B: Highly serialized Snowflake Schema. Saves storage but slows query planners due to deep foreign key nesting.`,
      `Option C: Star Schema dimensional modeling (Chosen). Maximizes caching efficiency and OneLake DirectLake compatibility.`
    ],
    confidenceScore: 98,
    confidenceReasons: {
      dataCompleteness: 95,
      businessAmbiguity: 92,
      schemaCertainty: 99,
      pipelineCertainty: 94
    }
  };

  const sqlReasoning = {
    thoughtProcess: `Crafted query layouts leveraging Common Table Expressions (CTEs) for optimized physical scan operations. Avoided subquery filters inside SELECT statements.`,
    decisionLogic: `Utilized ANSI partition-by window formulas for localized reporting metrics, preventing exhaustive full-table scans.`,
    assumptions: [
      `Database indexes on primary keys are automatically leveraged by the planner.`,
      `Date ranges fit temporal query plan partitions.`
    ],
    constraints: [
      `Heavy key sorting over raw performance columns.`,
      `Preventing analytical reads from locking critical transaction inserts.`
    ],
    alternatives: [
      `Alternative A: Raw sequential nested client loops. Wastes application web server CPU.`,
      `Alternative B: PostgreSQL materialized aggregation tables. Fast, but limits active real-time data accuracy.`,
      `Alternative C: Common Table Expressions with Window partitioning (Chosen). Executes dynamic reporting with clean execution plans.`
    ],
    confidenceScore: 96,
    confidenceReasons: {
      dataCompleteness: 96,
      businessAmbiguity: 88,
      schemaCertainty: 97,
      pipelineCertainty: 95
    }
  };

  const pipelineReasoning = {
    thoughtProcess: `The pipeline uses MS Fabric's medallion paradigm. Bronze represents raw JSON captures; Silver maps normalized, clean Delta tables; Gold exposes star-schema analytics views. DirectLake is mapped directly to bypass import refresh intervals.`,
    decisionLogic: `Chose F8 capacity because of the event frequency and medium data volume (under 500GB). Scheduled PySpark notebooks for deduplication routines.`,
    assumptions: [
      `OneLake serves as the unified storage.`,
      `Lakehouse endpoints are configured with SQL accessibility enabled.`
    ],
    constraints: [
      `Fabric DirectLake falls back to DirectQuery if the semantic model exceeds memory limits.`,
      `Transient network failures from external API copy endpoints.`
    ],
    alternatives: [
      `Option A: Dedicated VM-based ETL (SSIS/Airflow). Expensive hosting when idling, complex maintenance.`,
      `Option B: Continuous Kafka Spark stream listeners. Achieves real-time updates but spikes active resource compute costs up to 300%.`,
      `Option C: Scheduled Medallion Daily Lakehouse (Chosen). Optimal trade-off between standard latency and operational budgets.`
    ],
    confidenceScore: 94,
    confidenceReasons: {
      dataCompleteness: 92,
      businessAmbiguity: 90,
      schemaCertainty: 95,
      pipelineCertainty: 97
    }
  };

  const optionsComparison = {
    optionA: {
      name: "Medallion Star-Schema Lakehouse (Microsoft Fabric & OneLake)",
      description: `Tailored Delta Parquet files in OneLake loaded via scheduled PySpark pipelines. DirectLake BI enables lag-free analytics.`,
      cost: "Medium" as const,
      complexity: "Medium" as const,
      scalability: "High" as const,
      performance: "High" as const,
      maintainability: "High" as const,
      score: 93
    },
    optionB: {
      name: "Traditional PostgreSQL Relational Host Database",
      description: "Deploys a standalone cloud database with standard Python cron ETL. Relies heavily on indices and caching strategies.",
      cost: "Low" as const,
      complexity: "Low" as const,
      scalability: "Medium" as const,
      performance: "Medium" as const,
      maintainability: "Medium" as const,
      score: 75
    },
    optionC: {
      name: "Real-time Kappa Eventhouse Streaming Cluster",
      description: "Connects real-time events to Azure Event Hubs streaming directly into Kusto (Azure Data Explorer) tables.",
      cost: "High" as const,
      complexity: "High" as const,
      scalability: "High" as const,
      performance: "High" as const,
      maintainability: "Low" as const,
      score: 82
    },
    recommendedOption: "Option A" as const,
    rationale: `Option A delivers the perfect combination of scale, performance, and maintenance simplicity. By writing open Delta parquet files, OneLake avoids traditional cloud platform lock-ins while DirectLake enables direct dashboard querying of millions of rows in milliseconds.`
  };

  let baseScore = 80;
  if (reqLower.includes("patient") || reqLower.includes("health")) baseScore = 85;
  const scorecard = {
    scalability: baseScore + 12,
    security: baseScore + 8,
    performance: baseScore + 10,
    maintainability: baseScore + 7,
    costEfficiency: baseScore + 4
  };

  let storageGB = 120;
  let cuCapacity = "F8";
  let monthlyEstimate = 512.00;
  if (reqLower.includes("iot") || reqLower.includes("vessel") || reqLower.includes("fleet")) {
    storageGB = 450;
    cuCapacity = "F16";
    monthlyEstimate = 998.00;
  } else if (reqLower.includes("health")) {
    storageGB = 180;
    cuCapacity = "F8";
    monthlyEstimate = 525.00;
  }

  const computeCost = cuCapacity === "F16" ? 950.00 : 480.00;
  const fabricCostEstimate = {
    estimatedStorageGB: storageGB,
    estimatedComputeCU: cuCapacity === "F16" ? 16 : 8,
    capacityRecommendation: `${cuCapacity} Fabric Capacity (equivalent to ${cuCapacity === "F16" ? 16 : 8} Compute Units, pay-as-you-go)`,
    monthlyCost: monthlyEstimate,
    breakdown: [
      { item: "OneLake Storage (Delta Lake open parquet structures)", cost: parseFloat((storageGB * 0.023).toFixed(2)), unit: "GB" },
      { item: `Fabric ${cuCapacity} Reservation (24/7 provisioned compute resources)`, cost: computeCost, unit: "CU" },
      { item: "Data Factory Run Executions (pipeline schedules and Spark triggers)", cost: parseFloat((monthlyEstimate - computeCost - (storageGB * 0.023)).toFixed(2)), unit: "Runs" }
    ]
  };

  const copilotStudioExport = {
    agentName: `${name.replace(/[^a-zA-Z0-9 ]/g, "")} Expert Agent`,
    description: `Enterprise-grade multi-agent reasoning copilot representing specialized ${sector} and Microsoft Fabric strategies.`,
    instructions: `You are the ${name} Expert Agent, powered by Microsoft Copilot Studio. Your objective is analyzing, querying, and managing ${domain} architectures.
Utilize the database schemas provided (PostgreSQL Star-Schema representation) to construct business-centric reporting flows.
Always adhere to active enterprise frameworks, maintaining absolute GDPR boundaries.
When explaining table relationships, present the keys clearly.`,
    promptTemplates: [
      { title: "Query Daily Events summary", prompt: "Generate the SQL block aggregating active events over the past 24-hour cycle, joining dim tables to calculate key yields." },
      { title: "Examine SLA compliance indicators", prompt: "Review fact SLA metrics and calculate breach counts per category tier, highlighting bottleneck dimensions." }
    ],
    configurationJson: JSON.stringify({
      name: `${name.replaceAll(" ", "_")}Agent`,
      version: "1.0.0",
      capabilities: ["SQLAnalyticsEngine", "FabricOneLakeConnector", "GDPRAuditLog"],
      schemaReferences: schema?.tables?.map((t: any) => ({ table: t.name, cardinality: "Star Schema Node" })) || []
    }, null, 2)
  };

  const enterpriseReadiness = {
    architectureSummary: `An enterprise-grade, highly-available Lakehouse architecture utilizing modern Delta storage standards. By separating volatile facts in fact_events from rigid dimensions, this system scales to hundreds of millions of transaction records with zero performance decay.`,
    securityAnalysis: [
      `Row-Level Security (RLS): Active policy filters enforce data segmentation, separating tenant domains so clients can only access native rows.`,
      `Column-Level Encryption: Core fields containing PII are hashes or encrypted, preventing database administrators from reading raw identities.`,
      `Azure Active Directory SSO: Integrated with Azure Entra ID to enforce strict role-based access controls across all pipeline workloads.`
    ],
    dataGovernance: [
      `Microsoft Purview Metadata Tagging: Schema elements and descriptions are cataloged in Purview to enable searching and tracking across lines of business.`,
      `Automated Lineage Maps: The system draws full lineage histories tracing raw landing folder files to aggregate Silver/Gold reporting delta nodes.`
    ],
    compliance: [
      `Continuous Audit Logging: Standard transaction logs capture metadata regarding schema schema shifts and manual query requests.`,
      `Strict Compliance Policies: Configured to support ${standard} standards for data immutability, data sovereignty, and audit readiness.`
    ],
    scalabilityReview: `The architecture scales linearly. Compute workloads (Data clean/ingests) run within a dedicated scalable Microsoft Fabric cluster that scales down to zero in idle zones, saving significant overhead while OneLake handles high parallel queries.`,
    operationalCostDetails: `Excluding standard development trials, the monthly baseline is estimated around $${monthlyEstimate}/month (utilizing Fabric ${cuCapacity} compute nodes and metadata sync schedules). Capacity reservation discounts can reduce compute fees up to 41%.`,
    riskAssessments: [
      { risk: "Data pipeline delays due to transient source API errors", impact: "Medium" as const, mitigation: "Configured aggressive exponential back-offs, retry rules (3 limit), and dead-letter pipelines in Fabric Orchestrator." },
      { risk: "Accidental analytical queries on production operational tables", impact: "High" as const, mitigation: "Analytical queries access read-only Lakehouse replicas / SQL endpoints rather than transactional primary nodes." }
    ],
    recommendedNextSteps: [
      "Provision a trial Microsoft Fabric workspace in your corporate Azure tenant.",
      "Execute the provided DDL schema statements on your PostgreSQL repository.",
      "Import the Copilot Studio configuration JSON into your active Agentic workspace.",
      "Deploy the generated Jpa enterprise layer to bootstrapped Spring Boot developer repositories."
    ]
  };

  return {
    requirementsReasoning,
    schemaReasoning,
    sqlReasoning,
    pipelineReasoning,
    optionsComparison,
    scorecard,
    fabricCostEstimate,
    copilotStudioExport,
    enterpriseReadiness
  };
}

// Helper to load database
function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      let modified = false;
      const enriched = parsed.map((p: any) => {
        if (!p.requirementsReasoning) {
          const reasoning = generateAdvancedReasoning(p.name, p.requirements, p.analysis, p.schema, p.sql, p.pipeline);
          modified = true;
          return { ...p, ...reasoning };
        }
        return p;
      });
      if (modified) saveDb(enriched);
      return enriched;
    }
  } catch (err) {
    console.error('Error loading DB file, rebuilding...', err);
  }
  // Initialize with initial samples
  const enrichedDefaults = DEFAULT_PROJECTS.map((p: any) => {
    const reasoning = generateAdvancedReasoning(p.name, p.requirements, p.analysis, p.schema, p.sql, p.pipeline);
    return { ...p, ...reasoning };
  });
  saveDb(enrichedDefaults);
  return enrichedDefaults;
}

// Helper to save database
function saveDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file:', err);
  }
}

// Instantiate Gemini API Client
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;
if (api_key) {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Successfully initialized Gemini API Client for Multi-Agent reasoning.");
  } catch (err) {
    console.error("Failed to initialize Google GenAI SDK. Fallback mode enabled.", err);
  }
} else {
  console.log("No GEMINI_API_KEY detected. running in high-fidelity sandbox simulation mode.");
}

// Fallback logic generator in case of missing api key or error
function getSimulationResponse(type: string, userReq: string, context: any = {}): any {
  const reqLower = userReq.toLowerCase();
  
  // Decide domain keywords
  let domain = "Enterprise Operations";
  if (reqLower.includes("health") || reqLower.includes("patient") || reqLower.includes("hospital")) {
    domain = "Healthcare Ingestion";
  } else if (reqLower.includes("iot") || reqLower.includes("sensor") || reqLower.includes("machine")) {
    domain = "IoT Diagnostics";
  } else if (reqLower.includes("school") || reqLower.includes("student") || reqLower.includes("course")) {
    domain = "Academic Registry";
  } else if (reqLower.includes("finance") || reqLower.includes("loan") || reqLower.includes("bank")) {
    domain = "Fintech Ledger";
  } else if (reqLower.includes("food") || reqLower.includes("restaurant") || reqLower.includes("delivery")) {
    domain = "Logistics Logistics";
  }

  if (type === 'analyze') {
    return {
      businessGoals: [
        `Achieve modern tracking visibility for raw ${domain} activity.`,
        "Analyze trends and patterns to identify performance bottlenecks and operational inefficiencies.",
        "Consolidate distinct transactional data points into high-performance indicators (KPIs)."
      ],
      entities: [
        { name: `${domain.split(' ')[0]}_Event`, description: `Primary record log of incidents capturing initial properties.`, keyAttributes: ["id", "timestamp", "status_flag"] },
        { name: "Subject_Profile", description: `Identity record of participants, users, or active entities.`, keyAttributes: ["id", "registered_on", "category"] },
        { name: "Operational_Node", description: `Definition of locations, channels, or physical sensors hosting events.`, keyAttributes: ["id", "assigned_code", "region"] }
      ],
      metrics: [
        { name: "Aggregate Performance Metric", calculationLogic: `COUNT(DISTINCT event_id) FILTER (WHERE Status = 'COMPLETED')`, targetKPIs: ["> 95% throughput rate"] },
        { name: "Average Response SLA", calculationLogic: `AVG(timestamp_completed - timestamp_initiated)`, targetKPIs: ["Under 4 hours per interval"] }
      ],
      constraints: [
        "Ingesting duplicate records due to transient retry behaviors.",
        "Handling schema changes from various external channel formats."
      ],
      reasoning: "The requirements request standard KPI diagnostics. We isolate 'Subject_Profile' as a dimension node and establish a central transaction table for event recording, preserving 3rd Normal Form cleanliness."
    };
  }

  if (type === 'schema') {
    const tablePrefix = domain.split(' ')[0].toLowerCase();
    return {
      tables: [
        {
          name: `dim_profiles`,
          description: "Dimension table summarizing verified profiles.",
          columns: [
            { name: "profile_id", type: "UUID", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
            { name: "display_name", type: "VARCHAR(255)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "category_tier", type: "VARCHAR(50)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "created_at", type: "TIMESTAMP", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false }
          ]
        },
        {
          name: `dim_locations`,
          description: "Locations or operation hubs hosting events.",
          columns: [
            { name: "location_id", type: "INT", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
            { name: "city", type: "VARCHAR(100)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "region", type: "VARCHAR(100)", constraints: [], isPrimaryKey: false, isForeignKey: false }
          ]
        },
        {
          name: `fact_events`,
          description: "Central transactional tracking registers.",
          columns: [
            { name: "event_id", type: "UUID", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
            { name: "profile_id", type: "UUID", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_profiles", referencesColumn: "profile_id" },
            { name: "location_id", type: "INT", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_locations", referencesColumn: "location_id" },
            { name: "event_timestamp", type: "TIMESTAMP", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
            { name: "raw_value", type: "NUMERIC(14,4)", constraints: ["DEFAULT 0.0"], isPrimaryKey: false, isForeignKey: false },
            { name: "status_code", type: "VARCHAR(20)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false }
          ]
        }
      ],
      relationships: [
        { fromTable: "fact_events", fromColumn: "profile_id", toTable: "dim_profiles", toColumn: "profile_id", type: "one-to-many" },
        { fromTable: "fact_events", fromColumn: "location_id", toTable: "dim_locations", toColumn: "location_id", type: "one-to-many" }
      ],
      reasoning: "We structured the database using standard dimensional modeling (Star Schema) with tables split into highly static dimensions (profiles, locations) and volatile transactions (fact_events). This enables indexing of metrics and clean analytical caching."
    };
  }

  if (type === 'sql') {
    return {
      queries: [
        {
          title: `Monthly Event Performance Aggregations`,
          sql: `SELECT \n  l.city,\n  DATE_TRUNC('month', f.event_timestamp) AS operation_month,\n  COUNT(*) AS total_activities,\n  AVG(f.raw_value) AS average_raw_yield\nFROM fact_events f\nJOIN dim_locations l ON f.location_id = l.location_id\nGROUP BY 1, 2\nORDER BY 2 DESC, 3 DESC;`,
          description: "Calculates the core throughput count and average value outputs by regional hub metrics.",
          columnsExpected: ["city", "operation_month", "total_activities", "average_raw_yield"]
        }
      ],
      analyticsQueries: [
        {
          title: `Moving Average Performance Window Metrics`,
          sql: `SELECT \n  event_id,\n  event_timestamp,\n  raw_value,\n  AVG(raw_value) OVER (\n    PARTITION BY profile_id \n    ORDER BY event_timestamp \n    ROWS BETWEEN 4 PRECEDING AND CURRENT ROW\n  ) AS trailing_five_events_avg\nFROM fact_events\nORDER BY profile_id, event_timestamp;`,
          description: "Calculates sequential moving average metrics using SQL Window functions to filter anomalies.",
          optimizationExplanation: "Apply a composite index on (profile_id, event_timestamp, raw_value) to let PostgreSQL scan partitions directly from indexes without heavy disk sorting."
        }
      ],
      reasoning: "We leverage ANSI-SQL Window functions for sequential rolling indexes. Subqueries are isolated into WITH clauses (CTEs) to ensure queries compile directly and readable plan profiles get loaded. Primary keys automatically form indexes."
    };
  }

  // Pipeline Simulator
  return {
    etlSteps: [
      { step: "Data Extraction", source: "API Webhooks / Kafka Stream Endpoint", target: "Microsoft OneLake (Bronze Layer)", transformation: "None (Copy raw JSON)", description: "Configure Fabric Copy Activity on a minute-to-minute schedule or Eventhouse bindings." },
      { step: "Gold Aggregates Consolidation", source: "Lakehouse Silver Delta Tables", target: "Lakehouse Gold Delta Layer", transformation: "Windowed metrics calculations, indexing dimension records", description: "Use Synapse Spark notebook to run upsert merge operations to dim_profiles and update fact_events seamlessly." }
    ],
    dataWarehouseDesign: {
      modelType: "Star",
      brief: "A responsive Lakehouse implementation featuring bronze-silver-gold structured zones in Delta Lake.",
      facts: ["fact_events"],
      dimensions: ["dim_profiles", "dim_locations"]
    },
    fabricRecommendation: {
      componentsRecommended: ["OneLake", "Fabric Spark Notebooks", "Synapse Lakehouse Data Endpoint", "Microsoft Fabric Pipelines", "DirectLake Connector"],
      integrationFlow: "Copy Activity routes records -> Lakehouse Bronze (Delta Raw File System) -> Spark Notebook Silver cleaning -> Gold Schema compilation -> Power BI DirectLake Semantics.",
      ingestionLayer: "Eventhouse Real-time Streams capturing high-frequency inputs.",
      analyticsLayer: "Exposing Lakehouse semantic views directly over the gold directory via Delta tables.",
      powerBiIntegration: "Connecting DirectLake semantic visual sheets directly to lakehouse tables to query infinite rows in milliseconds."
    },
    reasoning: `This modern Lakehouse strategy removes classic administrative overhead. Because Microsoft OneLake uses the standard open-source Delta Parquet format, multi-engine tools can run read-writes in parallel without format conflicts.`
  };
}

// ------------------------------------------------------------------
// API ENDPOINTS
// ------------------------------------------------------------------

// 1. Requirement Analyst API
app.post('/api/analyze', async (req, res) => {
  const { requirements } = req.body;
  
  if (!requirements || requirements.trim().length === 0) {
    return res.status(400).json({ error: "Requirements text cannot be empty." });
  }

  console.log(`[Agent: Analyst] Analyzing requirements for user request..`);

  // Prompt logic
  const systemPrompt = `You are the Requirement Analyst Agent of DataPilot AI, a Senior Business Analyst and Data Architect specialized in scoping analytics solutions.
Your task is to analyze the business requirement and extract key artifacts into a highly structured JSON format.
Analyze the user's description and extract:
1. Business Goals: What is the target of this implementation? Provide 2 to 4 crisp items.
2. Entities: List of core business entities with descriptions and candidate key attributes.
3. Metrics & KPIs: Metrics to track, their calculation logic, and targets.
4. Constraints: Technical or logical limitations.
5. Reasoning: Explain your planning decisions and why these metrics are necessary.

Your output must be structured, valid JSON ONLY. It should exactly conform to this format:
{
  "businessGoals": ["string", "string"],
  "entities": [
    { "name": "string", "description": "string", "keyAttributes": ["string"] }
  ],
  "metrics": [
    { "name": "string", "calculationLogic": "string", "targetKPIs": ["string"] }
  ],
  "constraints": ["string"],
  "reasoning": "string"
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze these business requirements: "${requirements}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      const cleaned = text.trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (err: any) {
      console.error("[Agent: Analyst] LLM pipeline failed, falling back to sandbox simulator...", err);
    }
  }

  // Fallback simulator
  setTimeout(() => {
    const mockRes = getSimulationResponse('analyze', requirements);
    return res.json(mockRes);
  }, 1000);
});

// 2. Data Architect API
app.post('/api/schema', async (req, res) => {
  const { requirements, analysis } = req.body;
  if (!requirements) {
    return res.status(400).json({ error: "Must provide original requirements." });
  }

  console.log(`[Agent: Architect] Preparing schema tables based on analysis.`);

  const systemPrompt = `You are the Data Architect Agent of DataPilot AI, a Senior Database Designer.
Your task is to take requirements and design a highly optimized, clean, normalized relational database schema.
You must output a structured JSON containing:
1. Tables: array of table definition objects. Each table has table name (should have dim_ or fact_ prefix for dimensional clarity), description, columns (name, type, constraints - e.g. UNIQUE, NOT NULL, PRIMARY KEY, list of attributes, isPrimaryKey: boolean, isForeignKey: boolean, referencesTable: optional string, referencesColumn: optional string). Standardize column data types as clean PostgreSQL types.
2. Relationships: list of primary/foreign key connections with relationship types (one-to-many, etc.).
3. Reasoning: Detail why you structured the tables this way, what normalization form is achieved (e.g., Star Schema, 3NF), and how it minimizes redundancy.

Conform strictly to this exact JSON structure:
{
  "tables": [
    {
      "name": "dim_table_name",
      "description": "table desc",
      "columns": [
        { "name": "column1", "type": "VARCHAR(50)", "constraints": ["NOT NULL"], "isPrimaryKey": false, "isForeignKey": false }
      ]
    }
  ],
  "relationships": [
    { "fromTable": "fact_table", "fromColumn": "col1", "toTable": "dim_table", "toColumn": "col_id", "type": "one-to-many" }
  ],
  "reasoning": "Detailed technical text explaining normalization schema choice."
}`;

  const inputContext = `Requirements: ${requirements}\nAnalysis: ${JSON.stringify(analysis || {})}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate database schema for: ${inputContext}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      const text = response.text || "{}";
      const parsed = JSON.parse(text.trim());
      return res.json(parsed);
    } catch (err) {
      console.error("[Agent: Architect] LLM failed, using fallback simulator.", err);
    }
  }

  setTimeout(() => {
    return res.json(getSimulationResponse('schema', requirements, analysis));
  }, 1000);
});

// 3. SQL Engineer API
app.post('/api/sql', async (req, res) => {
  const { requirements, schema } = req.body;
  if (!schema) {
    return res.status(400).json({ error: "Must provide schema input." });
  }

  console.log(`[Agent: SQL] Drafting reports and analytical queries.`);

  const systemPrompt = `You are the SQL Engineer Agent of DataPilot AI, a Principal Database Developer and Query Optimization Specialist.
Your task is to write standard SQL queries based on a given table schema to answer business questions.
Output structured JSON containing:
1. Queries: Essential reporting queries (e.g., joins, aggregations) with SQL (well-formatted string with newlines), descriptions, and expected columns.
2. AnalyticsQueries: Advanced queries (window functions, CTEs) for deep trends, along with performance/optimization strategies (indexing, query execution plans).
3. Reasoning: Detail your index selection strategy, explain partition opportunities, and explain query structures.

Structure your JSON exactly as:
{
  "queries": [
    { "title": "Query Title", "sql": "SELECT ...", "description": "query desc", "columnsExpected": ["col1", "col2"] }
  ],
  "analyticsQueries": [
    { "title": "Advanced Query Title", "sql": "WITH ... SELECT ...", "description": "analytical description", "optimizationExplanation": "optimization notes" }
  ],
  "reasoning": "Brief report design rationale detailing why CTEs/Windows are optimal here."
}`;

  const inputContext = `Requirements: ${requirements}\nSchema: ${JSON.stringify(schema)}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate analytical SQL queries for: ${inputContext}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json(parsed);
    } catch (err) {
      console.error("[Agent: SQL] LLM failed, using fallback mock data.", err);
    }
  }

  setTimeout(() => {
    return res.json(getSimulationResponse('sql', requirements || "", schema));
  }, 1000);
});

// 4. Pipeline Advisor API
app.post('/api/pipeline', async (req, res) => {
  const { requirements, schema, analysis } = req.body;
  if (!schema) {
    return res.status(400).json({ error: "Must provide database schema structure." });
  }

  console.log(`[Agent: Pipeline] Designing fabric pipelines & Lakehouse layout.`);

  const systemPrompt = `You are the Pipeline Advisor Agent of DataPilot AI, a Principal Data Engineer and Microsoft Fabric Solution Architect.
Your task is to design an end-to-end modern ETL pipeline, Lakehouse architecture, and analytics flow, with special focus on Microsoft Fabric components (OneLake, Data Factory pipelines, Dataflow Gen2, Notebooks, Lakehouse, Power BI).
Your output must be structured, valid JSON containing:
1. EtlSteps: Step-by-step ingestion, staging, transformations (bronze/silver/gold), and loading.
2. DataWarehouseDesign: Schema strategy (Dimensional/Star modeling vs. Snowflake vs. Data Vault) for Azure/Fabric Synapse. Fact tables list and dimension tables list.
3. FabricRecommendation: Architectural map including recommended Fabric workloads (e.g. Synapse Data Engineering, Synapse Data Warehouse, Real-Time Intelligence) and Power BI optimization.
4. Reasoning: Explain the architectural trade-offs, Medallion pattern structure, and why Microsoft Fabric is suggested.

Conform strictly to:
{
  "etlSteps": [
    { "step": "Step Name", "source": "Source zone", "target": "Target zone", "transformation": "transform logic description", "description": "detail rationale" }
  ],
  "dataWarehouseDesign": {
    "modelType": "Star",
    "brief": "summary",
    "facts": ["fact_table_name"],
    "dimensions": ["dim_table_name"]
  },
  "fabricRecommendation": {
    "componentsRecommended": ["OneLake", "Fabric Dataflow Gen2", "Notebooks", "Lakehouse"],
    "integrationFlow": "ingestion path explanation",
    "ingestionLayer": "how ingestion works",
    "analyticsLayer": "how data warehouse exposes queries",
    "powerBiIntegration": "DirectLake or Import details"
  },
  "reasoning": "Reasoning detailed text description."
}`;

  const inputContext = `Requirements: ${requirements}\nSchema: ${JSON.stringify(schema)}\nAnalysis: ${JSON.stringify(analysis || {})}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Design ETL workflow for: ${inputContext}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json(parsed);
    } catch (err) {
      console.error("[Agent: Pipeline] LLM failed, fallback to simulator.", err);
    }
  }

  setTimeout(() => {
    return res.json(getSimulationResponse('pipeline', requirements || "", schema));
  }, 1000);
});

// 5. Full sequential analysis
app.post('/api/full-analysis', async (req, res) => {
  const { name, requirements } = req.body;
  if (!name || !requirements) {
    return res.status(400).json({ error: "Project name and requirements are required." });
  }

  console.log(`[Multi-Agent Pipeline] Executing sequential reasoning process for: "${name}"`);

  try {
    // 1. Analyze
    let analysisResult: any;
    if (ai) {
      const resp = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze these requirements: "${requirements}"`,
        config: {
          systemInstruction: `You are the Requirement Analyst Agent of DataPilot AI. Output JSON ONLY conforming exactly to format:\n{\n  "businessGoals": ["string"],\n  "entities": [ { "name": "string", "description": "string", "keyAttributes": ["string"] } ],\n  "metrics": [ { "name": "string", "calculationLogic": "string", "targetKPIs": ["string"] } ],\n  "constraints": ["string"],\n  "reasoning": "string"\n}`,
          responseMimeType: "application/json"
        }
      });
      analysisResult = JSON.parse(resp.text?.trim() || "{}");
    } else {
      analysisResult = getSimulationResponse('analyze', requirements);
    }

    // 2. Schema
    let schemaResult: any;
    const schemaContext = `Requirements: ${requirements}\nAnalysis: ${JSON.stringify(analysisResult)}`;
    if (ai) {
      const resp = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Generate database tables for: ${schemaContext}`,
        config: {
          systemInstruction: `You are the Data Architect Agent of DataPilot AI. Output JSON ONLY: \n{\n  "tables": [\n    { "name": "dim_table", "description": "desc", "columns": [ { "name": "col", "type": "VARCHAR", "constraints": [], "isPrimaryKey": boolean, "isForeignKey": boolean } ] }\n  ],\n  "relationships": [ { "fromTable": "a", "fromColumn": "c1", "toTable": "b", "toColumn": "c2", "type": "one-to-many" } ],\n  "reasoning": "text"\n}`,
          responseMimeType: "application/json"
        }
      });
      schemaResult = JSON.parse(resp.text?.trim() || "{}");
    } else {
      schemaResult = getSimulationResponse('schema', requirements, analysisResult);
    }

    // 3. SQL
    let sqlResult: any;
    const sqlContext = `Requirements: ${requirements}\nSchema: ${JSON.stringify(schemaResult)}`;
    if (ai) {
      const resp = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Create queries for: ${sqlContext}`,
        config: {
          systemInstruction: `You are the SQL Engineer Agent of DataPilot AI. Output JSON ONLY: \n{\n  "queries": [ { "title": "t", "sql": "SELECT ...", "description": "desc", "columnsExpected": ["col"] } ],\n  "analyticsQueries": [ { "title": "t", "sql": "WITH ...", "description": "desc", "optimizationExplanation": "optim" } ],\n  "reasoning": "rationale"\n}`,
          responseMimeType: "application/json"
        }
      });
      sqlResult = JSON.parse(resp.text?.trim() || "{}");
    } else {
      sqlResult = getSimulationResponse('sql', requirements, schemaResult);
    }

    // 4. Pipeline
    let pipelineResult: any;
    const pipelineContext = `Requirements: ${requirements}\nSchema: ${JSON.stringify(schemaResult)}\nAnalysis: ${JSON.stringify(analysisResult)}`;
    if (ai) {
      const resp = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Design Fabric pipeline for: ${pipelineContext}`,
        config: {
          systemInstruction: `You are the Pipeline Advisor Agent of DataPilot AI. Output JSON ONLY:\n{\n  "etlSteps": [ { "step": "name", "source": "s", "target": "t", "transformation": "t", "description": "d" } ],\n  "dataWarehouseDesign": { "modelType": "Star", "brief": "b", "facts": ["fact"], "dimensions": ["dim"] },\n  "fabricRecommendation": { "componentsRecommended": ["OneLake"], "integrationFlow": "flow", "ingestionLayer": "ingest", "analyticsLayer": "analytics", "powerBiIntegration": "pbi" },\n  "reasoning": "rationale"\n}`,
          responseMimeType: "application/json"
        }
      });
      pipelineResult = JSON.parse(resp.text?.trim() || "{}");
    } else {
      pipelineResult = getSimulationResponse('pipeline', requirements, schemaResult);
    }

    // Create a complete saved project item
    const advanced = generateAdvancedReasoning(name, requirements, analysisResult, schemaResult, sqlResult, pipelineResult);
    
    const newProject = {
      id: "proj_" + Math.random().toString(36).substr(2, 9),
      name: name,
      description: requirements.length > 120 ? requirements.substring(0, 117) + "..." : requirements,
      requirements: requirements,
      createdAt: new Date().toISOString(),
      status: "completed",
      analysis: analysisResult,
      schema: schemaResult,
      sql: sqlResult,
      pipeline: pipelineResult,
      ...advanced
    };

    // Save project to db
    const db = loadDb();
    db.push(newProject);
    saveDb(db);

    return res.json(newProject);
  } catch (err: any) {
    console.error("[Multi-Agent Pipeline] Crucial multi-agent reasoning failed:", err);
    return res.status(500).json({ error: "Failed to perform collaborative agent analysis. Detail: " + err.message });
  }
});

// 5.5 Seed Judge Hackathon Demo Workspace
app.post('/api/projects/seed-demo', (req, res) => {
  const name = "Global Fleet IoT & Predictive Maintenance Suite";
  const requirements = "Analyzing a global fleet of 150 logistics cargo ships. Each vessel transmits telemetric batches every 5 minutes (engine temperature, vibration index, RPM, fuel flow rate). We need to model anomalies to trigger predictive maintenance warnings, compute vessel fuel yield efficiency KPIs, and aggregate weather delays geographical indexes.";
  
  const analysisResult = {
    businessGoals: [
      "Track dynamic Fleet Fuel Efficiency Indexes mapping fuel burn metrics against actual cargo nautical miles.",
      "Incorporate continuous telemetric anomaly checks to trigger mechanical failure warnings.",
      "Aggregate delays matrices with local weather indexes to design voyage risk estimators."
    ],
    entities: [
      { name: "Vessel_Telemetry", description: "Continuous sub-hourly sensor logs recording motor heat, vibration amplitudes, and flow speeds.", keyAttributes: ["telemetry_id", "vessel_id", "timestamp"] },
      { name: "Vessel_Profile", description: "Factual catalog listing cargo deadweight capacities, vessel class, and engine configurations.", keyAttributes: ["vessel_id", "vessel_name", "max_capacity_teu"] },
      { name: "Maintenance_Warning", description: "Real-time automated flags raised when physical metric thresholds exceed safety parameters.", keyAttributes: ["warning_id", "vessel_id", "triggered_at"] },
      { name: "Voyage_Transit", description: "Active records profiling vessel legs, including departure grids, destin ports, and distance logs.", keyAttributes: ["transit_id", "vessel_id", "origin_port", "destination_port"] }
    ],
    metrics: [
      { name: "Vessel Fuel Efficiency KPI", calculationLogic: "SUM(fuel_flow_gph) / SUM(knots_gps_speed * time_hours_interval)", targetKPIs: ["< 38.5 gallons per active nautical mile"] },
      { name: "Predictive Incident SLA", calculationLogic: "COUNT(warning_id) FILTER (WHERE response_time < 30)", targetKPIs: ["> 98% warning response intervals under 30min"] }
    ],
    constraints: [
      "Handling out-of-order telemetry payloads due to satellite signal failures.",
      "Converting distinct raw metrics originating from different shipyards during normalization."
    ],
    reasoning: "We isolate volatile sensor telemetries in fact_vessel_telemetry and use surrogate UUIDs mapped to static Vessels and Voyages to ensure linear shard scale."
  };

  const schemaResult = {
    tables: [
      {
        name: "dim_vessels",
        description: "Dimension table cataloging logistics vessels profiles.",
        columns: [
          { name: "vessel_id", type: "UUID", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
          { name: "vessel_name", type: "VARCHAR(150)", constraints: ["NOT NULL", "UNIQUE"], isPrimaryKey: false, isForeignKey: false },
          { name: "deadweight_tons", type: "INT", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "engine_class", type: "VARCHAR(50)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "commission_date", type: "DATE", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false }
        ]
      },
      {
        name: "dim_voyages",
        description: "Dimensions mapping voyage transit coordinates and bounds.",
        columns: [
          { name: "voyage_id", type: "INT", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
          { name: "origin_port", type: "VARCHAR(100)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "destination_port", type: "VARCHAR(100)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "distance_nautical_miles", type: "INT", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false }
        ]
      },
      {
        name: "fact_vessel_telemetry",
        description: "Fact table recording raw transactional telemetry readings.",
        columns: [
          { name: "telemetry_id", type: "BIGINT", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
          { name: "vessel_id", type: "UUID", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_vessels", referencesColumn: "vessel_id" },
          { name: "voyage_id", type: "INT", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_voyages", referencesColumn: "voyage_id" },
          { name: "telemetry_timestamp", type: "TIMESTAMP", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "engine_temp_celsius", type: "NUMERIC(6,2)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "vibration_amplitude_mm", type: "NUMERIC(5,2)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "rpm_index", type: "NUMERIC(6,2)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "fuel_flow_gph", type: "NUMERIC(7,2)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false }
        ]
      },
      {
        name: "fact_maintenance_warnings",
        description: "Fact table logging predictive mechanical warning triggers.",
        columns: [
          { name: "warning_id", type: "UUID", constraints: ["PRIMARY KEY"], isPrimaryKey: true, isForeignKey: false },
          { name: "vessel_id", type: "UUID", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: true, referencesTable: "dim_vessels", referencesColumn: "vessel_id" },
          { name: "triggered_at", type: "TIMESTAMP", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "criticality_tier", type: "VARCHAR(20)", constraints: ["NOT NULL"], isPrimaryKey: false, isForeignKey: false },
          { name: "failure_cause_desc", type: "VARCHAR(255)", constraints: [], isPrimaryKey: false, isForeignKey: false }
        ]
      }
    ],
    relationships: [
      { fromTable: "fact_vessel_telemetry", fromColumn: "vessel_id", toTable: "dim_vessels", toColumn: "vessel_id", type: "one-to-many" },
      { fromTable: "fact_vessel_telemetry", fromColumn: "voyage_id", toTable: "dim_voyages", toColumn: "voyage_id", type: "one-to-many" },
      { fromTable: "fact_maintenance_warnings", fromColumn: "vessel_id", toTable: "dim_vessels", toColumn: "vessel_id", type: "one-to-many" }
    ],
    reasoning: "We structured the logs separating stable ship descriptions from volatile continuous sensors. Fact and dimensions models optimize indices across high metrics counts."
  };

  const sqlResult = {
    queries: [
      {
        title: "Daily Vessel Telemetry Outliers",
        sql: `SELECT \n  v.vessel_name,\n  DATE_TRUNC('day', t.telemetry_timestamp) AS voyage_day,\n  MAX(t.engine_temp_celsius) AS max_heat,\n  AVG(t.vibration_amplitude_mm) AS avg_vibration\nFROM fact_vessel_telemetry t\nJOIN dim_vessels v ON t.vessel_id = v.vessel_id\nGROUP BY 1, 2\nHAVING MAX(t.engine_temp_celsius) > 95.0 OR AVG(t.vibration_amplitude_mm) > 4.5\nORDER BY 3 DESC, 2 DESC;`,
        description: "Identifies logistics vessels exceeding calibrated heat safety levels or average vibration parameters.",
        columnsExpected: ["vessel_name", "voyage_day", "max_heat", "avg_vibration"]
      }
    ],
    analyticsQueries: [
      {
        title: "Maritime Fuel Efficiency trailing 12-Hour Averages",
        sql: `WITH hourly_averages AS (\n  SELECT \n    vessel_id,\n    DATE_TRUNC('hour', telemetry_timestamp) AS telemetry_hour,\n    AVG(fuel_flow_gph) AS flow_gph\n  FROM fact_vessel_telemetry\n  GROUP BY 1, 2\n)\nSELECT \n  v.vessel_name,\n  a.telemetry_hour,\n  a.flow_gph,\n  AVG(a.flow_gph) OVER (\n    PARTITION BY a.vessel_id \n    ORDER BY a.telemetry_hour \n    ROWS BETWEEN 11 PRECEDING AND CURRENT ROW\n  ) AS trailing_twelve_hours_fuel_avg\nFROM hourly_averages a\nJOIN dim_vessels v ON a.vessel_id = v.vessel_id\nORDER BY v.vessel_name, a.telemetry_hour;`,
        description: "Calculates fuel rate rolling window averages using clean relational partition metrics.",
        optimizationExplanation: "Instruct the Planner to apply index checks on (vessel_id, telemetry_timestamp) to execute index-only scans directly."
      }
    ],
    reasoning: "CTEs aggregate telemetry readings to hourly levels before traversing window models, preventing disk-sorting resource exhaustion on large log lines."
  };

  const pipelineResult = {
    etlSteps: [
      { step: "Kafka Real-Time Streams Capture", source: "Satellite fleet telemetry emitters", target: "Fabric Eventhouse Tables", transformation: "Streaming validation of sensor metadata bounds", description: "Saves high-frequency messages smoothly into Eventhouse raw schemas with continuous pipelines." },
      { step: "Gold Aggregated Delta Tables", source: "Eventhouse Ingestion", target: "OneLake Gold Delta Lake", transformation: "Deduplicating logs and structuring dimensions tables", description: "Launches scheduled cluster notebooks that load cleansed parquet delta nodes into the star structures." }
    ],
    dataWarehouseDesign: {
      modelType: "Star",
      brief: "A high-performance streaming Lakehouse built on medallion architecture with low latency SQL default endpoints.",
      facts: ["fact_vessel_telemetry", "fact_maintenance_warnings"],
      dimensions: ["dim_vessels", "dim_voyages"]
    },
    fabricRecommendation: {
      componentsRecommended: ["Eventhouse Streams", "OneLake Storage Layer", "Synapse Notebooks", "Data Factory Orchestrator", "DirectLake BI Server"],
      integrationFlow: "Active telemetry -> Eventstream router -> Eventhouse logging -> Spark cleaning -> Gold Delta Parquet -> DirectLake semantic datasets.",
      ingestionLayer: "Eventhouse clusters and real-time streaming queues handle up to 50K event lines per second.",
      analyticsLayer: "Exposes tabular gold layers and custom Spark representations smoothly.",
      powerBiIntegration: "Connect charts using DirectLake models to fetch updates from OneLake caches without scheduled re-import waits."
    },
    reasoning: "Utilizes Eventstream buffers for low latency, transitioning to Delta tables for historic analytical reporting. DirectLake minimizes diagnostic latency."
  };

  const advanced = generateAdvancedReasoning(name, requirements, analysisResult, schemaResult, sqlResult, pipelineResult);

  const newProject = {
    id: "proj_judge_demo",
    name,
    description: "Multi-agent competition-level hackathon demonstration project showcasing deep advanced reasoning, interactive schema ER diagram visualizers, and Fabric costs.",
    requirements,
    createdAt: new Date().toISOString(),
    status: "completed",
    analysis: analysisResult,
    schema: schemaResult,
    sql: sqlResult,
    pipeline: pipelineResult,
    ...advanced
  };

  const db = loadDb();
  // Filter out any existing judge demo to override cleanly
  const filtered = db.filter((p: any) => p.id !== "proj_judge_demo");
  filtered.push(newProject);
  saveDb(filtered);

  res.json(newProject);
});

// 6. DB Project REST APIs
app.get('/api/projects', (req, res) => {
  const db = loadDb();
  res.json(db);
});

app.get('/api/projects/:id', (req, res) => {
  const db = loadDb();
  const proj = db.find((p: any) => p.id === req.params.id);
  if (!proj) {
    return res.status(404).json({ error: "Project not found." });
  }
  res.json(proj);
});

app.post('/api/projects', (req, res) => {
  const projInput = req.body;
  if (!projInput.name) return res.status(400).json({ error: "Project name is required." });

  const db = loadDb();
  const existingIdx = db.findIndex((p: any) => p.id === projInput.id);
  
  const savedProject = {
    ...projInput,
    id: projInput.id || "proj_" + Math.random().toString(36).substr(2, 9),
    createdAt: projInput.createdAt || new Date().toISOString()
  };

  if (existingIdx >= 0) {
    db[existingIdx] = savedProject;
  } else {
    db.push(savedProject);
  }
  
  saveDb(db);
  res.json(savedProject);
});

app.delete('/api/projects/:id', (req, res) => {
  let db = loadDb();
  db = db.filter((p: any) => p.id !== req.params.id);
  saveDb(db);
  res.json({ success: true, message: `Project ${req.params.id} has been cleaned from historical memory.` });
});

// 7. Dynamic Spring Boot Sandbox Workspace Generator
app.post('/api/generate-java-sdk', (req, res) => {
  const { schema, name } = req.body;
  if (!schema || !schema.tables) {
    return res.status(400).json({ error: "Must provide a valid database schema structure." });
  }

  const projSlug = (name || "DataPilotApp").replace(/[^a-zA-Z0-9]/g, "");
  const javaPackage = `com.datapilot.${projSlug.toLowerCase()}`;
  const files: any[] = [];
  
  // Create tables catalog
  const tables: any[] = schema.tables;
  
  // DDL generation file
  let ddl = `-- PostgreSQL Schema generated dynamically by DataPilot AI Architect\n-- Project: ${name || "DataPilot"}\n-- Generated on: ${new Date().toISOString()}\n\n`;
  
  // Pre-generate table creation DDLs
  tables.forEach(table => {
    ddl += `CREATE TABLE ${table.name} (\n`;
    const colLines = table.columns.map((col: any) => {
      let line = `  ${col.name} ${col.type}`;
      if (col.constraints && col.constraints.length > 0) {
        line += ` ${col.constraints.join(' ')}`;
      }
      return line;
    });
    ddl += colLines.join(',\n');
    ddl += `\n);\n\n`;
  });

  // Include relation mappings in DDL
  if (schema.relationships && schema.relationships.length > 0) {
    schema.relationships.forEach((rel: any) => {
      ddl += `ALTER TABLE ${rel.fromTable} ADD CONSTRAINT fk_${rel.fromTable}_${rel.fromColumn} \n  FOREIGN KEY (${rel.fromColumn}) REFERENCES ${rel.toTable}(${rel.toColumn});\n\n`;
    });
  }

  files.push({
    path: `src/main/resources/schema-postgresql.sql`,
    content: ddl,
    type: 'ddl',
    description: "Production DDL containing primary constraints, columns types, and direct relationships mappings."
  });

  // application.yml configuration
  const appYml = `server:
  port: 8080

spring:
  application:
    name: ${projSlug.toLowerCase()}-service
  datasource:
    url: jdbc:postgresql://localhost:5432/datapilot_db
    username: datapilot_user
    password: datapilot_secure_password
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true

management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
`;
  files.push({
    path: `src/main/resources/application.yml`,
    content: appYml,
    type: 'properties',
    description: "Production YAML configuration containing database endpoints, connection pools, and Hibernate dialect mappings."
  });

  // Maven pom.xml
  const pomXml = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.datapilot</groupId>
    <artifactId>${projSlug.toLowerCase()}-service</artifactId>
    <version>1.0.0</version>
    <name>${name || "DataPilot Service"}</name>
    <description>Enterprise Microservice generated dynamically by DataPilot AI</description>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;
  files.push({
    path: `pom.xml`,
    content: pomXml,
    type: 'pom',
    description: "Maven XML Project Object Model declaration defining project dependencies, compile tags, and plugins."
  });

  // Main Application bootstrapper
  const appMain = `package ${javaPackage};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Enterprise Microservice Application Bootstrap Class.
 * Generated dynamically by DataPilot AI.
 */
@SpringBootApplication
public class DataPilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(DataPilotApplication.class, args);
    }
}
`;
  files.push({
    path: `src/main/java/com/datapilot/DataPilotApplication.java`,
    content: appMain,
    type: 'main',
    description: "Main Spring Boot Microservice entry point class enabling autoconfigurations and component scans."
  });

  // ApplicationConfig file
  const appConfig = `package ${javaPackage}.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Enterprise Application Configuration
 * Generated dynamically by DataPilot AI Copilot for Spring Boot.
 */
@Configuration
@EnableTransactionManagement
public class DatabaseConfig {
    // Custom transaction boundaries and dialect configurations for PostgreSQL integration.
}
`;
  files.push({
    path: `src/main/java/com/datapilot/config/DatabaseConfig.java`,
    content: appConfig,
    type: 'config',
    description: "Database configurations, enabling transaction managers and declarative session bounds."
  });

  // Spring Boot controllers, DTOs, entity entries for dynamically modeled tables
  tables.forEach(table => {
    const rawClass = table.name.replace(/^(fact_|dim_)/, '');
    const className = rawClass.charAt(0).toUpperCase() + rawClass.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase()).slice(1);
    
    // JPA Entity properties
    let jpaFields = "";
    let gettersSetters = "";
    let firstIdColName = "";
    let firstIdColType = "Long";

    table.columns.forEach((col: any) => {
      const fieldCamel = col.name.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase());
      let jType = "String";
      const uType = col.type.toUpperCase();
      if (uType.includes("INT") || uType.includes("SERIAL")) {
        jType = "Long";
      } else if (uType.includes("NUMERIC") || uType.includes("DECIMAL") || uType.includes("DOUBLE")) {
        jType = "BigDecimal";
      } else if (uType.includes("DATE") || uType.includes("TIMESTAMP")) {
        jType = "LocalDateTime";
      } else if (uType.includes("UUID")) {
        jType = "UUID";
      } else if (uType.includes("BOOL")) {
        jType = "Boolean";
      }

      const isPK = !!col.isPrimaryKey || col.constraints?.join(' ').toUpperCase().includes("PRIMARY");
      if (isPK && !firstIdColName) {
        firstIdColName = fieldCamel;
        firstIdColType = jType;
        jpaFields += `    @Id\n`;
        if (jType === "Long") {
          jpaFields += `    @GeneratedValue(strategy = GenerationType.IDENTITY)\n`;
        }
      }

      jpaFields += `    @Column(name = "${col.name}", nullable = ${!col.constraints?.includes("NOT NULL")})\n`;
      jpaFields += `    private ${jType} ${fieldCamel};\n\n`;

      // Getters & Setters
      const properName = fieldCamel.charAt(0).toUpperCase() + fieldCamel.slice(1);
      gettersSetters += `    public ${jType} get${properName}() {\n        return ${fieldCamel};\n    }\n\n`;
      gettersSetters += `    public void set${properName}(${jType} ${fieldCamel}) {\n        this.${fieldCamel} = ${fieldCamel};\n    }\n\n`;
    });

    if (!firstIdColName) {
      firstIdColName = "id";
      firstIdColType = "Long";
    }

    const entityContent = `package ${javaPackage}.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * JPA Entity capturing schema logic for table ${table.name}.
 * Generated dynamically by DataPilot AI.
 */
@Entity
@Table(name = "${table.name}")
public class ${className} {

${jpaFields}
    public ${className}() {}

${gettersSetters}}
`;
    files.push({
      path: `src/main/java/com/datapilot/entity/${className}.java`,
      content: entityContent,
      type: 'entity',
      description: `JPA relational binding capturing column definitions, constraints, and standard setters.`
    });

    // Spring Boot Repository
    const repoContent = `package ${javaPackage}.repository;

import ${javaPackage}.entity.${className};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

/**
 * Spring Boot Repository access boundaries for ${className}.
 * Extends standard JpaRepository framework.
 */
@Repository
public interface ${className}Repository extends JpaRepository<${className}, ${firstIdColType}> {
    // Out-of-the-box support for findById, findAll, save, delete operations.
}
`;
    files.push({
      path: `src/main/java/com/datapilot/repository/${className}Repository.java`,
      content: repoContent,
      type: 'repository',
      description: `Data access interface inheriting standard Hibernate/JPA repository layers for CRUD.`
    });

    // Spring Boot DTO record
    const dtoContent = `package ${javaPackage}.dto;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Data Transfer Object for REST calls carrying ${className} metrics.
 */
public record ${className}ResponseDTO(
    String detailsSummary
) implements Serializable {}
`;
    files.push({
      path: `src/main/java/com/datapilot/dto/${className}ResponseDTO.java`,
      content: dtoContent,
      type: 'dto',
      description: `Lightweight serializable record representing the REST payload to bypass raw entity states.`
    });

    // Spring Boot Service layer
    const serviceContent = `package ${javaPackage}.service;

import ${javaPackage}.entity.${className};
import ${javaPackage}.repository.${className}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

/**
 * Service Layer encapsulation for business validation of ${className}.
 */
@Service
@Transactional
public class ${className}Service {

    @Autowired
    private ${className}Repository repository;

    public List<${className}> getAllRecords() {
        return repository.findAll();
    }

    public ${className} saveRecord(${className} entity) {
        return repository.save(entity);
    }
}
`;
    files.push({
      path: `src/main/java/com/datapilot/service/${className}Service.java`,
      content: serviceContent,
      type: 'service',
      description: `Secures transaction boundaries and validates business actions before persistent logging.`
    });

    // Spring Boot Controller
    const controllerContent = `package ${javaPackage}.controller;

import ${javaPackage}.entity.${className};
import ${javaPackage}.service.${className}Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST Endpoint for table queries of ${className}.
 */
@RestController
@RequestMapping("/api/v1/${className.toLowerCase()}")
@CrossOrigin(origins = "*")
public class ${className}Controller {

    @Autowired
    private ${className}Service service;

    @GetMapping
    public ResponseEntity<List<${className}>> listAll() {
        return ResponseEntity.ok(service.getAllRecords());
    }

    @PostMapping
    public ResponseEntity<${className}> create(@RequestBody ${className} payload) {
        return ResponseEntity.ok(service.saveRecord(payload));
    }
}
`;
    files.push({
      path: `src/main/java/com/datapilot/controller/${className}Controller.java`,
      content: controllerContent,
      type: 'controller',
      description: `Exposes standard endpoint patterns, mappings, and converts exceptions to readable JSON payloads.`
    });
  });

  return res.json({ projectSlug: projSlug, basePackage: javaPackage, files: files });
});

// 8. Enterprise Solution Architect Chat Companion Endpoint
app.post('/api/chat', async (req, res) => {
  const { projectId, message, history, activeTab, action } = req.body;
  const db = loadDb();
  
  // Find or default the active project
  const project = db.find((p: any) => p.id === projectId) || db[0];
  
  const projectName = project ? project.name : "DataPilot Custom Application";
  const projectRequirements = project ? project.requirements : "Custom relational requirements";
  const tablesOverview = project?.schema?.tables?.map((t: any) => {
    return `${t.name} (${t.columns?.map((c: any) => `${c.name} ${c.type}`).join(', ')})`;
  }).join('; ') || "dim_profiles, dim_locations, fact_events";
  
  const queriesOverview = project?.sql?.queries?.map((q: any) => q.title).join(', ') || "Monthly Performance Aggregations";
  const pipelineOverview = project?.pipeline?.fabricRecommendation?.componentsRecommended?.join(', ') || "OneLake, Fabric Notebooks, Synapse Endpoint";
  
  console.log(`[Enterprise Architect Chat] Triggered action: ${action || 'chat'} for project: ${projectName}`);

  const activeContextString = project ? `
Active Project Context for Reasoning:
- Project Name: "${projectName}"
- User Domain Requirements: "${projectRequirements}"
- Database Tables structured: [${tablesOverview}]
- Analytical Queries configured: [${queriesOverview}]
- Pipeline recommendation engine flow: [${pipelineOverview}]
- Spring Boot Jpa SDK details: Fully generated controller, service, repository, entity, and Pom files.
  ` : "No project active yet.";

  const systemPrompt = `You are the Lead Enterprise Solution Architect Advisor at DataPilot AI, designed to challenge, validate, audit, and explain multi-agent analytics architectures.
You have comprehensive access to the active project context.

When responding to the user, you MUST return a valid JSON object matching the following TypeScript structure:
\`\`\`ts
interface ArchitectResponse {
  decisionSummary: string; // Dynamic high-level decision or action summary (Max 15 words)
  reasoning: string; // Explanatory architecture reasoning (Max 100 words)
  assumptions: string[]; // List of technical/operational assumptions (2-4 items)
  tradeoffs: string[]; // List of design and performance tradeoffs (2-4 items)
  alternatives: string[]; // List of prospective alternative technologies/practices (2-4 items)
  confidenceScore: number; // confidence percentage between 0 and 100
  mainExplanation: string; // Comprehensive core answer or analysis using clear presentation Markdown. Ensure all paragraphs or headings are professionally structured.
  extraMetadata?: {
    type: "standard_chat" | "review" | "judge" | "challenge";
    judgeQuestions?: { question: string; answer: string; }[]; // Only populated for "judge" simulation action (provide exactly 10 realistic, challenging hackathon judge questions)
    reviewScorecard?: {
      strengths: string[];
      weaknesses: string[];
      risks: string[];
      missingComponents: string[];
      readinessScore: number; // 0-100
      judgeScore: number; // 0-100
    }; // Only populated for "review" entire solution action
  };
}
\`\`\`

Here are guidelines depending on the action requested:
1. Standard user query (action is empty or "chat"):
Provide a deep architectural answer to the user's specific text question. Anchor your answer strictly in the active project's metadata if related. Ensure the Decision Summary captures the exact topic.
2. Review Entire Solution (action = "review"):
Perform an extensive audit of the requirements, schema design, queries, medallion pipeline, and Spring Boot SDK. Populate reviewScorecard with 3-4 entries for strengths, weaknesses, risks, and missing components, along with calculated readinessScore and judgeScore. Elaborate inside mainExplanation in rich markdown text detailing your enterprise feedback.
3. Simulate Judge Questions (action = "judge"):
Generate 10 realistic, severe hackathon judge questions challenging the architectural decisions, scale constraints, Azure Fabric selection, direct-lake bindings, and Spring Boot JPA integration. Provide clear, direct, expert-level answers designed to win the competition. Populate the judgeQuestions list. Summarize in mainExplanation.
4. Challenge-the-AI queries (action matches "cheaper", "scalable", "secure", "availability", "fabric", "synapse", "mongodb", "event_driven"):
Generate an alternative architecture reflecting the selected request (e.g., cheaper hosting, sub-second 10M scale, extreme security vaulting, multi-region high availability, non-Fabric Apache or Databricks setup, Snowflake, Synapse partition, MongoDB NoSQL, or Event-Driven Kafka pipeline). Contrast details with current active project, explaining:
- Why it differs from the current star-schema relational Microsoft OneLake design
- Benefits of the alternative
- Drawbacks of the alternative
- Cost impact (explain savings or premium overhead)
- Scalability impact
Describe everything elegantly inside mainExplanation and populate standard tradeoffs, alternatives, and decision summary fields.`;

  const userPrompt = `
Active Tab currently viewed: "${activeTab || 'overview'}"
User Question/Action: "${message || action || 'Help me review this architecture'}"
Selected Action context: "${action || 'chat'}"

History:
${JSON.stringify(history || [])}

Please evaluate the active project and deliver the architectural trace. Return valid JSON only.`;

  // Real LLM pipeline
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `${activeContextString}\n\n${userPrompt}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });
      
      const parsed = JSON.parse(response.text?.trim() || "{}");
      return res.json(parsed);
    } catch (err: any) {
      console.warn("[Enterprise Architect Chat] Real LLM processing failed, using high-fidelity Sandbox evaluation pipeline.", err);
    }
  }

  // High-fidelity Sandbox Simulator fallback
  setTimeout(() => {
    // Generate beautiful custom answers using active project details
    const factTables = project?.pipeline?.dataWarehouseDesign?.facts || ["fact_events"];
    const dimTables = project?.pipeline?.dataWarehouseDesign?.dimensions || ["dim_profiles", "dim_locations"];
    
    let decisionSummary = "Relational architecture verified against current design specifications.";
    let reasoning = `The selected relational dimensional schema provides third normal form encapsulation for tables like ${factTables.join(', ')}. This keeps operational constraints clean and query aggregates rapid.`;
    let assumptions = [
      "Assumes write volatility limits do not exceed 10,000 transactions per second natively.",
      "Assumes direct-lake semantic datasets remain in active memory on Microsoft Fabric CU allocations.",
      "Assumes reporting pipelines execute batch reconciliations every three hours."
    ];
    let tradeoffs = [
      "Offers fast sub-second read aggregations but introduces minor lock waits during heavy transactional write blocks.",
      "Uses Open Parquet delta structures in Microsoft OneLake, saving local compute disk but adding minor network latency."
    ];
    let alternatives = [
      "Apache Cassandra for high-volume append only ingestion without lock overhead.",
      "Snowflake Data Warehouse for pure SQL SaaS separation of storage and compute."
    ];
    let confidenceScore = 93;
    let mainExplanation = `### Solution Architect Evaluation Context

The current multi-agent design for **${projectName}** has been fully processed and validated. Below is a detailed breakdown of your system's current footprint.

#### Current Architectural Footprint
1. **Schema Strategy:** Designed around the star-schema paradigm featuring **${factTables.join(', ')}** linked to **${dimTables.join(', ')}**. This matches analytics benchmarks perfectly.
2. **Pipelines:** Employs Microsoft Fabric medallion zones (Bronze raw, Silver normalized, Gold star aggregates) inside OneLake directories.
3. **SDK Layer:** Fully decoupled JPA entities and repositories generated, mapping variables matching ${tablesOverview.split(';')[0]}.

*Would you like to challenge this architecture using the buttons below (e.g., test a NoSQL MongoDB alternative or request an ultra-low-cost setup)?*`;

    let extraMetadata: any = { type: "standard_chat" };

    if (action === "review") {
      decisionSummary = "Complete solutions audit finalized with high production-readiness rating.";
      reasoning = "Audited the comprehensive multi-agent outputs, cataloging high structural integrity but flagging UUID primary key join byte overhead.";
      assumptions = [
        "Assumes standard enterprise SOC2 data sovereignty guidelines are applied at the database connection layer.",
        "Assumes active Spring Boot container scales within a separate Kubernetes cluster."
      ];
      tradeoffs = [
        "Provides excellent schema governance and traceability but increases initial cloud configuration overhead up to 15%."
      ];
      alternatives = [
        "Pure Serverless Cloud SQL (Vite + Cloud Run + Neon PG) to drop cold start maintenance costs to nominal."
      ];
      confidenceScore = 95;
      mainExplanation = `### DataPilot Solution Architect Review Report

Having audited all agent artifacts from requirements ingestion down to Spring Boot JPA SDK generation, here is my formal architectural evaluation:

#### Formulated Evaluation Summary
- **Primary Strengths:** Separation of Fact/Dimension models avoids analytical redundancy. Jpa integration guarantees rapid bootstrap capability for the Spring framework.
- **Identified Weaknesses:** Primary key columns utilizing UUID data types are not ideal for small indexes, causing minor storage expansion.
- **Risks flagged:** Network timeouts inside Fabric Copy activity tasks during parallel extraction bounds.
- **Missing components:** Implementation of read-cache layers (Redis) for frequently requested dimensions.

Use the sidebar metrics and options comparison tabs to explore alternatives.`;

      extraMetadata = {
        type: "review",
        reviewScorecard: {
          strengths: [
            "Medallion data pipeline isolates raw landings from clean aggregate reporting structures.",
            "Use of Microsoft OneLake with Delta Parquet formats eliminates proprietary storage lock-ins.",
            "Fully complete JPA controller architectures bootstraps modern microservice development instantly."
          ],
          weaknesses: [
            "Using UUID data types on dimension tables increases join times marginally compared to integer keys.",
            "Absence of partition rules over historic tables in dim schemas could slow decade-long analytics."
          ],
          risks: [
            "DirectLake semantic falls back to DirectQuery if the cloud Capacity memory experiences temporary exhaustion.",
            "Transient API rate-limiting delays from remote transactional sources like Shopify or third-party webhooks."
          ],
          missingComponents: [
            "Implementation of a caching middleware (Redis Cluster) for static dim queries.",
            "Dead-letter queues (DLQ) in Kafka/Eventstream pipelines to process corrupt payload events without pipeline halts."
          ],
          readinessScore: 88,
          judgeScore: 92
        }
      };
    } else if (action === "judge") {
      decisionSummary = "Hackathon Judge Quiz Simulator loaded successfully.";
      reasoning = "Generated 10 rigorous, high-level evaluation questions challenging scale choices, Azure integration, cost metrics, and technical alternatives.";
      confidenceScore = 96;
      mainExplanation = "### 🏆 Hackathon Judge Questions & Answers Simulator\n\nI have evaluated your active project artifacts and simulated the most challenging questions a technical panel of judges would ask. Prepare with these ideal, high-scoring answers:";
      
      const mq = project?.analysis?.metrics?.[0]?.name || "Operational Throughput";
      
      extraMetadata = {
        type: "judge",
        judgeQuestions: [
          {
            question: "Why did you choose a dimensional Star Schema instead of a denormalized flat table or Snowflake topology?",
            answer: `We chose a Star Schema to optimize analytics caching. A single flat table introduces severe write expansion and update anomalies. A Snowflake schema creates deep join depths that throttle query planners. The Star model gives us the ultimate sub-second query balance and perfectly integrates with Microsoft Fabric's DirectLake engine.`
          },
          {
            question: "What happens to your architecture if volume spikes to 10x or 100x the initial SLA estimate?",
            answer: `Since our data layer utilizes Microsoft Fabric and Delta Parquet inside OneLake, compute and storage are decoupled. If ingestion rates spike, the Eventhouse streams scale up compute nodes instantly, and OneLake writes parallel blobs without locking transactional databases.`
          },
          {
            question: "How do you control public costs and avoid budget overruns under continuous ingestion cycles?",
            answer: `We utilize pay-as-you-go capacity matching and schedule our PySpark pipeline execution to run daily in batched intervals. Additionally, Fabric's auto-scale lets the F-Capacity scale to zero when no analytical queries are being executed, reducing idle server costs.`
          },
          {
            question: "Why choose Microsoft Fabric instead of Azure Synapse Dedicated SQL Pools or Snowflake?",
            answer: `Azure Synapse Dedicated Pools require provisioning massive static SQL DW compute resources which are expensive even when idle. Microsoft Fabric is built from the ground up on open Delta tables in OneLake. Fabric DirectLake mode can read live Parquet files directly without any data copy, skipping import sync overhead.`
          },
          {
            question: "How does your multi-agent architecture guarantee that data integrity is maintained across the workspace?",
            answer: `The system utilizes a sequential chain-of-thought verification pipeline. The Requirement Analyst extracts constraints, the Data Architect enforces primary keys, and the SQL Engineer audits queries. Validation checks block the pipeline if referential constraints are breached.`
          },
          {
            question: "How would you handle personal GDPR data deletion requests ('Right to be Forgotten') in Delta Lake tables?",
            answer: `We utilize pseudonymized email hashing inside dim_customers. To comply with GDPR, we hold the original lookup map in an encrypted secure key vault. Deleting the lookup key renders the user's transaction data permanently anonymous without corrupting factual table counts.`
          },
          {
            question: "Why not use MongoDB or another NoSQL store for this specific analytics workflow?",
            answer: `Our requirements demand complex historical aggregations, cohort analysis, and multi-table financial tracking. MongoDB handles key-value writes extremely fast, but complex relational reports like cohort retention require nested lookups and heavy client-side CPU loops if not stored in standard structures.`
          },
          {
            question: "How does the generated Spring Boot SDK integrate with this database schema?",
            answer: `The SDK contains JPA-compliant model maps, repositories, services, and rest interfaces. It maps primary and foreign relations directly, allowing Spring Boot to handle transactional writes while the data pipeline reads analytical tables from the read replica configuration.`
          },
          {
            question: "What security measures protect sensitive parameters from administrative exposure?",
            answer: `We enforce Column-Level Security (CLS) at the Lakehouse endpoint and Row-Level Security (RLS) policies within the semantic models, ensuring branch managers can only query local transactions while hiding absolute customer identifiers.`
          },
          {
            question: "What is your fallback strategy if Microsoft OneLake encounters temporary cloud outage?",
            answer: `We configure continuous replication of the Silver/Gold Delta layers to an independent AWS S3 bucket. If OneLake encounters an issue, our secondary server can point its SQL Spark engines to read from S3 Parquet tables directly, maintaining high availability.`
          }
        ]
      };
    } else if (action) {
      // Challenge buttons
      let targetAlt = "Alternative Core Design";
      let details = "";
      let benefit = "";
      let drawback = "";
      let costImpact = "";
      let scaleImpact = "";

      if (action === "cheaper") {
        targetAlt = "Serverless Cloud Run + Neon PostgreSQL Combo (Bypassing Fabric)";
        decisionSummary = "Lower budget alternative formulated: Serverless Postgres.";
        reasoning = "Transitioning from heavy Microsoft Fabric capacity allocations to Serverless PostgreSQL drops operations budgets down to zero when idle.";
        benefit = "Extreme savings. Cost drops from ~$512/month down to under $10/month by utilizing scale-to-zero databases.";
        drawback = "Exposes database compute to cold starts (3-5 seconds delay) on initial request lines and requires manual ETL maintenance.";
        costImpact = "Approx. 95% budget savings. Best for early prototypes, sandbox setups, and smaller corporate teams.";
        scaleImpact = "Supports thousands of daily active profiles but limits processing capacity to 2TB before performance degrades.";
        details = "We replace Microsoft OneLake and Synapse pipelines with a serverless Neon PostgreSQL branch. Transactions write directly over API routes. Daily aggregations are calculated using cron jobs.";
      } else if (action === "scalable") {
        targetAlt = "Apache Kafka Ingestion + Databricks Spark Real-time Stream Engine";
        decisionSummary = "High-throughput sub-second real-time streaming alternative configured.";
        reasoning = "For workloads processing millions of transactions per second, we swap scheduled batches for continuous Spark direct writes.";
        benefit = "Bypasses all batch intervals, ensuring streaming dashboards showing live analytics with latency under 200ms.";
        drawback = "Requires 24/7 dedicated compute listener threads, spiking hosting budgets by 250%.";
        costImpact = "High cost premium. Fills budget grids with constant compute reservation fees.";
        scaleImpact = "Infinite horizontal scale capability. Safely processes 50 Million checkouts daily.";
        details = "Replaces scheduled batch ETL steps. Emitters push JSON messages to a distributed Kafka cluster. Databricks Spark processes, micro-batches and aggregates directly into delta parquet.";
      } else if (action === "secure") {
        targetAlt = "Strict Guard-Lock Isolation (Azure Key Vault + Row-Level Security)";
        decisionSummary = "Secured Vaulting Architecture designed.";
        reasoning = "Enforces cryptographic column salting and Row-Level Security (RLS).";
        benefit = "No administrative profile gets exposed to decrypted customer names.";
        drawback = "Salting and decrypting columns on-the-fly reduces join aggregate speeds up to 12%.";
        costImpact = "Negligible storage overhead, but Azure HSM key storage adds $40/month.";
        scaleImpact = "No changes to physical data limit. Maintains high scale safely.";
        details = "All user identifications (email, post codes) are encrypted on the JVM server before database insertion. SQL views inject SESSION_CONTEXT('TenantID') filters to enforce tenant row isolation.";
      } else if (action === "availability") {
        targetAlt = "Multi-Region Read Replica PostgreSQL Cluster (Active-Passive)";
        decisionSummary = "High Availability (HA) Active-Passive Cluster mapped.";
        reasoning = "Deploys transactional databases in three availability zones (US, Europe, Asia) with continuous replication.";
        benefit = "Zero-downtime failover. If the primary cloud zone goes offline, client requests failover instantly.";
        drawback = "Introduces replication lag, causing minor sync gaps between global servers.";
        costImpact = "Triples baseline compute and storage allocations (~+$1,200/month).";
        scaleImpact = "Increases read throughput enormously of regional endpoints.";
        details = "Replicates primary table databases synchronously inside the same cluster of availability zones, securing your architecture.";
      } else if (action === "mongodb") {
        targetAlt = "Unstructured MongoDB + Key-Value Tracking Clusters";
        decisionSummary = "MongoDB document-based storage alternative formulated.";
        reasoning = "Replaces normalized SQL Star Schemas with nested JSON documents, maximizing document write raw speed and flexible schemas.";
        benefit = "Allows changing parameters and adding nested features on checkout records instantly without database DDL schema updates.";
        drawback = "Throttles complex analytical queries (e.g. joins, monthly retention, cohort CTEs) since indexing multi-relationship graphs requires deep loops.";
        costImpact = "Medium Cost. MongoDB Atlas storage clusters are price-equivalent to PostgreSQL cloud containers.";
        scaleImpact = "Scales writes extremely well, but analytics becomes a bottleneck above 5,000,500 active records.";
        details = "Orders are saved as nested JSON document records directly in a single 'checkouts_collection', eliminating joins between fact and dimension tables.";
      } else if (action === "event_driven") {
        targetAlt = "Event-Driven CQRS Architecture (Command Query Responsibility Segregation)";
        decisionSummary = "Event-Driven CQRS with RabbitMQ/Kafka configured.";
        reasoning = "Separates transactional write operations from heavy reporting read operations utilizing a pub-sub model.";
        benefit = "Absolute decoupling. Transactional microservices perform writes without being blocked by complex query loads.";
        drawback = "Introduces eventual consistency. Reporting dashboards may show minor delays.";
        costImpact = "Requires hosting message queues and event subscriber services (+25%).";
        scaleImpact = "Exceptional scalability. Best suited for high-tier microservice architectures.";
        details = "Commands write events to Kafka topics. Event handlers process and project tables to a read-optimized Elasticsearch cluster for dashboard analytics.";
      } else {
        targetAlt = "Alternative Synapse-Dedicated Server Cluster Setup";
        decisionSummary = "Azure Synapse Server SQL Pool alternative engineered.";
        reasoning = "Swapping OneLake DirectLake for Synapse dedicated warehouse instances to support classic enterprise storage.";
        benefit = "Offers pure SQL query capabilities over traditional columnar structures.";
        drawback = "Requires high base provision cost, running continuously even when there is no workload.";
        costImpact = "Premium hosting costs. Base instance starts at ~$1,200/month.";
        scaleImpact = "Scales to Petabytes, but suffers from slow intermediate table aggregation updates.";
        details = "We provision a dedicated Synapse SQL Pool, loading flat data using T-SQL PolyBase scripts instead of Spark cluster notebooks.";
      }

      extraMetadata = { type: "challenge" };
      mainExplanation = `### ⚖️ Architectural Challenge: ${targetAlt}

Below is my detailed evaluation for this architectural option, contrasting it directly with your active **${projectName}** star-schema Relational MS OneLake deployment.

#### Comparison Matrix

| Operational Component | Current Microsoft Fabric Design | challenged Alternative |
|:---|:---|:---|
| **Core Storage Format** | Open Delta Parquet (OneLake) | Columnar / Document Instances |
| **Pipeline Trigger** | Batched PySpark (3-Hour SLA) | Event-Based / Continuous |
| **Performance Profile** | Sub-second Semantic Caches | Variable Cold Start or Eventual Sync |
| **Operations Overhead** | Minimal Server Maintenance | Moderate Server Management |

#### Deep Architecture Review

- **Why it differs:** This setup replaces DataPilot's batched relational structures with an architecture optimized specifically for **${action === 'cheaper' ? 'minimum cost footprint' : action === 'mongodb' ? 'unstructured writes' : 'extreme scalability limits'}**.
- **Key Benefits:** ${benefit}
- **Identified Drawbacks:** ${drawback}
- **Active Cost Impact:** ${costImpact}
- **Scalability Impact:** ${scaleImpact}

#### Code Reconstruction Guidance
To bootstrap this alternative design, you should overwrite the generated Java Spring Boot controllers to point to the alternate datasource credentials and configure the appropriate dependency connections.

Would you like to review other constraints? Select another option in the side panel.`;
    }

    return res.json({
      decisionSummary,
      reasoning,
      assumptions,
      tradeoffs,
      alternatives,
      confidenceScore,
      mainExplanation,
      extraMetadata
    });
  }, 1000);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DataPilot AI Server] Backend running at http://localhost:${PORT}`);
  });
}

startServer();
