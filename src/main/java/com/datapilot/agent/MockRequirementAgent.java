package com.datapilot.agent;

import com.datapilot.dto.RequirementAnalysisResponse;
import com.datapilot.dto.RequirementAnalysisResponse.EntityDefinition;
import com.datapilot.dto.RequirementAnalysisResponse.MetricDefinition;
import com.datapilot.model.Reasoning;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("mockRequirementAgent")
public class MockRequirementAgent implements RequirementAgent {

    @Override
    public RequirementAnalysisResponse analyze(String requirements) {
        String reqLower = (requirements != null) ? requirements.toLowerCase() : "";

        List<String> goals = new ArrayList<>();
        List<EntityDefinition> entities = new ArrayList<>();
        List<MetricDefinition> metrics = new ArrayList<>();
        List<String> constraints = new ArrayList<>();
        String decisionText;
        String reasoningText;

        if (reqLower.contains("e-commerce") || reqLower.contains("sales") || reqLower.contains("retail") || reqLower.contains("shop")) {
            goals.addAll(List.of(
                "Consolidate multi-channel transactions (Shopify, Amazon, Retail POS) to calculate net business yield.",
                "Track Gross-to-Net Sales metrics (gross sales less discounts, returns, and delivery fees).",
                "Monitor order-to-delivery SLA and shipment speed variables."
            ));

            entities.add(new EntityDefinition("Order", "Root log for transactional events across platforms.", List.of("id", "source_channel", "timestamp", "gross_amount")));
            entities.add(new EntityDefinition("Order_Item", "Line detail reflecting SKU details and counts per basket.", List.of("id", "product_id", "quantity", "unit_price")));
            entities.add(new EntityDefinition("Customer", "Consolidated loyalty subscriber record.", List.of("id", "signup_cohort", "postal_code", "email_hash")));
            entities.add(new EntityDefinition("Channel", "Origin definitions (Shopify, Amazon, Retail POS).", List.of("id", "name", "commission_rate")));

            metrics.add(new MetricDefinition("Net Sales Yield", "SUM(gross_amount) - SUM(discounts) - SUM(refunded_amount)", List.of("> $2.5MM quarterly")));
            metrics.add(new MetricDefinition("Fulfillment Speed SLA", "AVG(timestamp_shipped - timestamp_created)", List.of("< 1.8 days average")));

            constraints.addAll(List.of(
                "Isolate distinct currency codes normalising back into USD.",
                "Manage partial refunds and split line-item delivery actions."
            ));

            decisionText = "Medallion Star-Schema architecture selected over flat denormalised logs.";
            reasoningText = "Isolating Order_Items is required to compute dynamic basket abandonment indexes without full table scans.";
        } else if (reqLower.contains("health") || reqLower.contains("patient") || reqLower.contains("hospital")) {
            goals.addAll(List.of(
                "Track patient admission rates, discharge intervals, and clinic occupancy index.",
                "Consolidate patient treatment cycles and diagnostic registers.",
                "Secure diagnostic fields conforming to HIPAA & GDPR rules."
            ));

            entities.add(new EntityDefinition("Patient", "Consolidated record of clinical participants.", List.of("id", "name_hash", "dob", "gender")));
            entities.add(new EntityDefinition("Encounter", "Clinical visits or registration records.", List.of("id", "patient_id", "clinic_id", "encounter_type", "admitted_at", "discharged_at")));
            entities.add(new EntityDefinition("Provider", "Clinicians or staff conducting patient encounters.", List.of("id", "license_number", "department")));

            metrics.add(new MetricDefinition("Clinic Bed Occupancy Rate", "COUNT(encounter_id) WHERE status='ADMITTED' / TOTAL_BEDS * 100", List.of("< 85% occupancy optimal")));
            metrics.add(new MetricDefinition("Avg Length of Stay", "AVG(discharged_at - admitted_at)", List.of("< 4.2 days average")));

            constraints.addAll(List.of(
                "PII data fields like names and emails must be encrypted or hashed.",
                "Handling backdated admission logs from transient outage periods."
            ));

            decisionText = "Healthcare HIPAA compliant dimensional Lakehouse selected.";
            reasoningText = "Separating patient identifiers into a secure dim_patients layout allows column-level security filters.";
        } else {
            // General business fallback
            goals.addAll(List.of(
                "Ingest enterprise operational logs for real-time diagnostics.",
                "Establish structured metrics to trace operational inefficiencies.",
                "Deliver consolidated analytics sheets to BI visualization layers."
            ));

            entities.add(new EntityDefinition("Activity_Event", "Central transaction tracking records.", List.of("id", "timestamp", "status_flag", "raw_value")));
            entities.add(new EntityDefinition("Subject_Profile", "Identity record of participants or actors.", List.of("id", "registered_on", "category_tier")));
            entities.add(new EntityDefinition("Operational_Node", "Locations, channels, or hardware assets.", List.of("id", "region", "assigned_code")));

            metrics.add(new MetricDefinition("Throughput SLA Yield", "COUNT(event_id) WHERE Status='COMPLETED' / TOTAL_EVENTS", List.of("> 98% success rate")));
            metrics.add(new MetricDefinition("Avg Node Latency", "AVG(end_time - start_time)", List.of("< 250ms average")));

            constraints.addAll(List.of(
                "Ingesting duplicate records due to client retry loops.",
                "Inconsistent timestamp zones normalized to UTC."
            ));

            decisionText = "Standard Star-Schema catalog pattern chosen.";
            reasoningText = "Separating profiles and operational nodes into dimension tables ensures high caching ratios.";
        }

        Reasoning reasoning = Reasoning.builder()
                .decision(decisionText)
                .reasoning(reasoningText)
                .assumptions(List.of(
                    "Timestamp logs are stored in UTC.",
                    "External inputs arrive in periodic batch intervals."
                ))
                .alternatives(List.of(
                    "Flat single log collection (slow queries)",
                    "Normalized Snowflake Schema (complex multi-joins)"
                ))
                .confidenceScore(95)
                .build();

        return RequirementAnalysisResponse.builder()
                .businessGoals(goals)
                .entities(entities)
                .metrics(metrics)
                .constraints(constraints)
                .reasoning(reasoning)
                .build();
    }
}
