package com.datapilot.agent;

import com.datapilot.dto.RequirementAnalysisResponse;
import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.SchemaResponse.TableDefinition;
import com.datapilot.dto.SchemaResponse.ColumnDefinition;
import com.datapilot.dto.SchemaResponse.RelationshipDefinition;
import com.datapilot.model.Reasoning;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("mockSchemaAgent")
public class MockSchemaAgent implements SchemaAgent {

    @Override
    public SchemaResponse generateSchema(String requirements, RequirementAnalysisResponse analysis) {
        String reqLower = (requirements != null) ? requirements.toLowerCase() : "";

        List<TableDefinition> tables = new ArrayList<>();
        List<RelationshipDefinition> relationships = new ArrayList<>();
        String decisionText;
        String reasoningText;

        if (reqLower.contains("e-commerce") || reqLower.contains("sales") || reqLower.contains("retail") || reqLower.contains("shop")) {
            // dim_channels
            tables.add(TableDefinition.builder()
                    .name("dim_channels")
                    .description("Transactional sale channels catalog.")
                    .columns(List.of(
                        new ColumnDefinition("channel_id", "INT", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("channel_name", "VARCHAR(50)", List.of("NOT NULL", "UNIQUE"), false, false, null, null),
                        new ColumnDefinition("commission_rate", "NUMERIC(5,4)", List.of("DEFAULT 0.0"), false, false, null, null)
                    ))
                    .build());

            // dim_customers
            tables.add(TableDefinition.builder()
                    .name("dim_customers")
                    .description("Unified subscriber profiles.")
                    .columns(List.of(
                        new ColumnDefinition("customer_id", "UUID", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("email_hash", "VARCHAR(64)", List.of("NOT NULL", "UNIQUE"), false, false, null, null),
                        new ColumnDefinition("signup_cohort", "DATE", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("postal_code", "VARCHAR(12)", List.of(), false, false, null, null)
                    ))
                    .build());

            // fact_orders
            tables.add(TableDefinition.builder()
                    .name("fact_orders")
                    .description("Core sales transactions fact table.")
                    .columns(List.of(
                        new ColumnDefinition("order_id", "UUID", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("customer_id", "UUID", List.of("NOT NULL"), false, true, "dim_customers", "customer_id"),
                        new ColumnDefinition("channel_id", "INT", List.of("NOT NULL"), false, true, "dim_channels", "channel_id"),
                        new ColumnDefinition("order_timestamp", "TIMESTAMP", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("gross_amount", "NUMERIC(12,2)", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("discounts_applied", "NUMERIC(10,2)", List.of("DEFAULT 0.0"), false, false, null, null),
                        new ColumnDefinition("refunded_amount", "NUMERIC(10,2)", List.of("DEFAULT 0.0"), false, false, null, null)
                    ))
                    .build());

            relationships.add(new RelationshipDefinition("fact_orders", "customer_id", "dim_customers", "customer_id", "one-to-many"));
            relationships.add(new RelationshipDefinition("fact_orders", "channel_id", "dim_channels", "channel_id", "one-to-many"));

            decisionText = "Star Schema model selected for optimal analytics indexing.";
            reasoningText = "Placing channel metrics inside fact_orders enables DirectLake semantic mapping without intermediate ETL loops.";
        } else if (reqLower.contains("health") || reqLower.contains("patient") || reqLower.contains("hospital")) {
            // dim_patients
            tables.add(TableDefinition.builder()
                    .name("dim_patients")
                    .description("Secure patient profiles.")
                    .columns(List.of(
                        new ColumnDefinition("patient_id", "UUID", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("name_hash", "VARCHAR(64)", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("dob", "DATE", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("gender", "VARCHAR(10)", List.of(), false, false, null, null)
                    ))
                    .build());

            // dim_providers
            tables.add(TableDefinition.builder()
                    .name("dim_providers")
                    .description("Clinical staff registration catalog.")
                    .columns(List.of(
                        new ColumnDefinition("provider_id", "INT", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("license_number", "VARCHAR(50)", List.of("NOT NULL", "UNIQUE"), false, false, null, null),
                        new ColumnDefinition("department", "VARCHAR(100)", List.of("NOT NULL"), false, false, null, null)
                    ))
                    .build());

            // fact_encounters
            tables.add(TableDefinition.builder()
                    .name("fact_encounters")
                    .description("Patient clinical admission and discharge encounter logs.")
                    .columns(List.of(
                        new ColumnDefinition("encounter_id", "UUID", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("patient_id", "UUID", List.of("NOT NULL"), false, true, "dim_patients", "patient_id"),
                        new ColumnDefinition("provider_id", "INT", List.of("NOT NULL"), false, true, "dim_providers", "provider_id"),
                        new ColumnDefinition("encounter_type", "VARCHAR(50)", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("admitted_at", "TIMESTAMP", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("discharged_at", "TIMESTAMP", List.of(), false, false, null, null),
                        new ColumnDefinition("billing_amount", "NUMERIC(12,2)", List.of("DEFAULT 0.0"), false, false, null, null)
                    ))
                    .build());

            relationships.add(new RelationshipDefinition("fact_encounters", "patient_id", "dim_patients", "patient_id", "one-to-many"));
            relationships.add(new RelationshipDefinition("fact_encounters", "provider_id", "dim_providers", "provider_id", "one-to-many"));

            decisionText = "HIPAA Compliant Star Schema topology implemented.";
            reasoningText = "Storing demographic attributes separately in dim_patients secures medical records behind database view boundaries.";
        } else {
            // General business fallback
            // dim_profiles
            tables.add(TableDefinition.builder()
                    .name("dim_profiles")
                    .description("Operational participant profiles.")
                    .columns(List.of(
                        new ColumnDefinition("profile_id", "UUID", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("display_name", "VARCHAR(255)", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("category_tier", "VARCHAR(50)", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("created_at", "TIMESTAMP", List.of("NOT NULL"), false, false, null, null)
                    ))
                    .build());

            // dim_locations
            tables.add(TableDefinition.builder()
                    .name("dim_locations")
                    .description("Facility and operational node details.")
                    .columns(List.of(
                        new ColumnDefinition("location_id", "INT", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("city", "VARCHAR(100)", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("region", "VARCHAR(100)", List.of(), false, false, null, null)
                    ))
                    .build());

            // fact_events
            tables.add(TableDefinition.builder()
                    .name("fact_events")
                    .description("Core operational transaction tracking.")
                    .columns(List.of(
                        new ColumnDefinition("event_id", "UUID", List.of("PRIMARY KEY"), true, false, null, null),
                        new ColumnDefinition("profile_id", "UUID", List.of("NOT NULL"), false, true, "dim_profiles", "profile_id"),
                        new ColumnDefinition("location_id", "INT", List.of("NOT NULL"), false, true, "dim_locations", "location_id"),
                        new ColumnDefinition("event_timestamp", "TIMESTAMP", List.of("NOT NULL"), false, false, null, null),
                        new ColumnDefinition("raw_value", "NUMERIC(14,4)", List.of("DEFAULT 0.0"), false, false, null, null),
                        new ColumnDefinition("status_code", "VARCHAR(20)", List.of("NOT NULL"), false, false, null, null)
                    ))
                    .build());

            relationships.add(new RelationshipDefinition("fact_events", "profile_id", "dim_profiles", "profile_id", "one-to-many"));
            relationships.add(new RelationshipDefinition("fact_events", "location_id", "dim_locations", "location_id", "one-to-many"));

            decisionText = "Standard transactional Star-schema selected.";
            reasoningText = "Fact events isolate numerical values, preventing memory locks during high-throughput query runs.";
        }

        Reasoning reasoning = Reasoning.builder()
                .decision(decisionText)
                .reasoning(reasoningText)
                .assumptions(List.of(
                    "Primary keys use UUIDs or integers.",
                    "Cascade delete is disabled on reference foreign keys for transactional audit logging."
                ))
                .alternatives(List.of(
                    "Snowflake layout with deep joins",
                    "Single denormalized Wide Table layout"
                ))
                .confidenceScore(98)
                .build();

        return SchemaResponse.builder()
                .tables(tables)
                .relationships(relationships)
                .reasoning(reasoning)
                .build();
    }
}
