package com.datapilot.agent;

import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.PipelineResponse;
import com.datapilot.dto.PipelineResponse.EtlStep;
import com.datapilot.dto.PipelineResponse.DataWarehouseDesign;
import com.datapilot.dto.PipelineResponse.FabricRecommendation;
import com.datapilot.model.Reasoning;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("mockPipelineAgent")
public class MockPipelineAgent implements PipelineAgent {

    @Override
    public PipelineResponse generatePipeline(String requirements, SchemaResponse schema) {
        String reqLower = (requirements != null) ? requirements.toLowerCase() : "";

        List<EtlStep> steps = new ArrayList<>();
        List<String> facts = new ArrayList<>();
        List<String> dimensions = new ArrayList<>();
        List<String> components = List.of("OneLake", "Fabric Dataflow Gen2", "Notebooks", "Synapse Lakehouse", "DirectLake Connector", "Power BI");
        String integrationFlow;
        String ingestionLayer;
        String analyticsLayer;
        String powerBiIntegration;

        String decisionText;
        String reasoningText;

        if (reqLower.contains("e-commerce") || reqLower.contains("sales") || reqLower.contains("retail") || reqLower.contains("shop")) {
            steps.add(new EtlStep("Data Extraction", "Shopify REST API, S3 CSV bucket", "OneLake Landing Folder (Bronze)", "None (Direct copy)", "Fabric Copy Activities run on a scheduled pipeline to ingest platform raw logs."));
            steps.add(new EtlStep("Silver Layer Cleaning", "Landing Bronze Lakehouse", "Silver Layer Catalog", "Normalising types, mapping customer email hashes", "Synapse Spark PySpark notebooks clean corrupt records, normalise timezone fields and hash customer IDs."));
            steps.add(new EtlStep("Gold Layer Dimensional Load", "Silver Layer Catalog", "Gold Lakehouse (Delta Parquet)", "Loading Star Schema keys", "Notebooks update dim_customers and dim_channels, and load fact_orders with foreign keys."));

            facts.add("fact_orders");
            dimensions.addAll(List.of("dim_customers", "dim_channels"));

            integrationFlow = "Copy API outputs -> Lakehouse Bronze (Delta Raw) -> Notebook Silver cleansing -> Lakehouse Gold (Delta Parquet) -> DirectLake semantic dataset -> Power BI visualisations.";
            ingestionLayer = "Platform JSON files pulled every three hours via scheduled Data Factory Copy tasks.";
            analyticsLayer = "Gold tables are exposed via Lakehouse SQL Endpoint, providing read access for analytical applications.";
            powerBiIntegration = "Utilise Power BI DirectLake mode to query live Delta Parquet files in OneLake directly, avoiding traditional import refresh overhead.";

            decisionText = "Microsoft Fabric Medallion medallion pattern implemented.";
            reasoningText = "Using open Delta Parquet files inside OneLake allows parallel access from Spark notebooks and Power BI, saving cloud storage costs.";
        } else if (reqLower.contains("health") || reqLower.contains("patient") || reqLower.contains("hospital")) {
            steps.add(new EtlStep("Secure Ingestion", "Hospital EHR HL7 feed", "OneLake Secure Bronze (Delta)", "FHIR conversion", "Ingest clinical feeds and convert into structured Bronze table directories."));
            steps.add(new EtlStep("Silver De-identification", "Bronze Secure Lakehouse", "Silver De-identified Catalog", "PII column encryption", "Enforce strict patient de-identification routines, hashing identifiers and encrypting medical history fields."));
            steps.add(new EtlStep("Gold Medical Cohort Aggregation", "Silver Catalog", "Gold Research Lakehouse", "Star Schema encounters loading", "Load fact_encounters with foreign keys mapped to dim_patients and dim_providers."));

            facts.add("fact_encounters");
            dimensions.addAll(List.of("dim_patients", "dim_providers"));

            integrationFlow = "HL7 feeds -> Azure Event Hub -> Medallion Bronze -> Notebook Silver (De-identification) -> Gold Lakehouse -> DirectLake dataset -> Power BI clinical charts.";
            ingestionLayer = "EHR changes streamed in real-time via Azure Event Hubs and Spark streaming notebooks.";
            analyticsLayer = "Secure analytical endpoint exposing gold tables under database security views.";
            powerBiIntegration = "Connect Power BI via secure DirectLake links, enforcing row-level security (RLS) policies based on the clinician's Active Directory profile.";

            decisionText = "Secure Medallion pipeline with real-time stream ingestion selected.";
            reasoningText = "Applying patient de-identification in the Silver Spark step ensures downstream BI developers cannot access raw PII fields.";
        } else {
            // General business fallback
            steps.add(new EtlStep("Raw Log Ingestion", "Syslog file feeds, API JSONs", "OneLake Landing (Bronze)", "None", "Ingest operational logs into unified bronze Delta directory."));
            steps.add(new EtlStep("Silver Cleansing", "Bronze Raw Directory", "Silver Cleansed Catalog", "Null checks, parsing JSONs", "Spark notebook filters corrupt messages and checks field schemas."));
            steps.add(new EtlStep("Gold Dimensional Load", "Silver Cleansed Catalog", "Gold Lakehouse (Delta)", "Upserting dimension tables", "Process and load fact_events connected to dim_profiles and dim_locations."));

            facts.add("fact_events");
            dimensions.addAll(List.of("dim_profiles", "dim_locations"));

            integrationFlow = "API/Syslogs -> Bronze Lakehouse -> Spark Silver cleaning -> Gold Delta Parquet -> DirectLake semantic dataset -> Power BI dashboards.";
            ingestionLayer = "Batch folder copies scheduled every 1 hour via Fabric Data Factory Pipelines.";
            analyticsLayer = "SQL Analytics endpoint exposes Gold tables to third-party query clients.";
            powerBiIntegration = "Expose Gold tables as a DirectLake semantic model, delivering lag-free query performance.";

            decisionText = "Scheduled Medallion Lakehouse pipeline selected.";
            reasoningText = "Separating compute schedules into hourly blocks matches the business reporting cycle, reducing capacity overhead.";
        }

        DataWarehouseDesign warehouse = DataWarehouseDesign.builder()
                .modelType("Star")
                .brief("Star-schema layout optimized for Microsoft Fabric OneLake Delta storage.")
                .facts(facts)
                .dimensions(dimensions)
                .build();

        FabricRecommendation fabric = FabricRecommendation.builder()
                .componentsRecommended(components)
                .integrationFlow(integrationFlow)
                .ingestionLayer(ingestionLayer)
                .analyticsLayer(analyticsLayer)
                .powerBiIntegration(powerBiIntegration)
                .build();

        Reasoning reasoning = Reasoning.builder()
                .decision(decisionText)
                .reasoning(reasoningText)
                .assumptions(List.of(
                    "OneLake serves as the unified storage solution.",
                    "Lakehouse默认SQL Endpoint is enabled for external access."
                ))
                .alternatives(List.of(
                    "Traditional VM-based ETL (SSIS/Airflow) - high operational cost",
                    "Continuous event streaming (Kafka/Synapse Stream) - excessive 24/7 compute fees"
                ))
                .confidenceScore(94)
                .build();

        return PipelineResponse.builder()
                .etlSteps(steps)
                .dataWarehouseDesign(warehouse)
                .fabricRecommendation(fabric)
                .reasoning(reasoning)
                .build();
    }
}
