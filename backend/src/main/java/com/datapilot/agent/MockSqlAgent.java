package com.datapilot.agent;

import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.SqlResponse;
import com.datapilot.dto.SqlResponse.QueryDefinition;
import com.datapilot.dto.SqlResponse.AnalyticsQueryDefinition;
import com.datapilot.model.Reasoning;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component("mockSqlAgent")
public class MockSqlAgent implements SqlAgent {

    @Override
    public SqlResponse generateSql(String requirements, SchemaResponse schema) {
        String reqLower = (requirements != null) ? requirements.toLowerCase() : "";

        List<QueryDefinition> queries = new ArrayList<>();
        List<AnalyticsQueryDefinition> analyticsQueries = new ArrayList<>();
        String decisionText;
        String reasoningText;

        if (reqLower.contains("e-commerce") || reqLower.contains("sales") || reqLower.contains("retail") || reqLower.contains("shop")) {
            queries.add(QueryDefinition.builder()
                    .title("Monthly Gross and Net Sales by Channel")
                    .sql("""
                        SELECT 
                          c.channel_name,
                          DATE_TRUNC('month', o.order_timestamp) AS sale_month,
                          SUM(o.gross_amount) AS gross_sales,
                          SUM(o.gross_amount - o.discounts_applied - o.refunded_amount) AS net_sales
                        FROM fact_orders o
                        JOIN dim_channels c ON o.channel_id = c.channel_id
                        GROUP BY 1, 2
                        ORDER BY 2 DESC, 3 DESC;
                        """)
                    .description("Calculates monthly sales metrics per business channel to capture product performance.")
                    .columnsExpected(List.of("channel_name", "sale_month", "gross_sales", "net_sales"))
                    .build());

            analyticsQueries.add(AnalyticsQueryDefinition.builder()
                    .title("Customer Cohort Retention Rate Analytics")
                    .sql("""
                        WITH customer_orders AS (
                          SELECT 
                            customer_id,
                            order_timestamp,
                            DATE_TRUNC('month', order_timestamp) AS order_month
                          FROM fact_orders
                        ),
                        first_purchases AS (
                          SELECT 
                            customer_id,
                            MIN(DATE_TRUNC('month', order_timestamp)) AS cohort_month
                          FROM fact_orders
                          GROUP BY 1
                        )
                        SELECT 
                          f.cohort_month,
                          COUNT(DISTINCT f.customer_id) AS cohort_size,
                          COUNT(DISTINCT co.customer_id) AS active_retained_users
                        FROM first_purchases f
                        LEFT JOIN customer_orders co ON f.customer_id = co.customer_id 
                          AND co.order_month = f.cohort_month + INTERVAL '1 month'
                        GROUP BY 1
                        ORDER BY 1;
                        """)
                    .description("Tracks month-over-month loyalty cohort index dynamics using nested CTE layers.")
                    .optimizationExplanation("Create composite index on (customer_id, order_timestamp). Run CLUSTER on fact_orders to group rows by dates.")
                    .build());

            decisionText = "Common Table Expressions (CTEs) leveraged over traditional nested subqueries.";
            reasoningText = "Isolating temporal queries within WITH blocks ensures database engine query plan pre-compiles successfully.";
        } else if (reqLower.contains("health") || reqLower.contains("patient") || reqLower.contains("hospital")) {
            queries.add(QueryDefinition.builder()
                    .title("Monthly Patient Admission Count by Department")
                    .sql("""
                        SELECT 
                          p.department,
                          DATE_TRUNC('month', e.admitted_at) AS admission_month,
                          COUNT(e.encounter_id) AS total_admissions,
                          SUM(e.billing_amount) AS department_billing_total
                        FROM fact_encounters e
                        JOIN dim_providers p ON e.provider_id = p.provider_id
                        GROUP BY 1, 2
                        ORDER BY 2 DESC, 3 DESC;
                        """)
                    .description("Analyzes monthly patient inflow counts and aggregated billing totals per provider division.")
                    .columnsExpected(List.of("department", "admission_month", "total_admissions", "department_billing_total"))
                    .build());

            analyticsQueries.add(AnalyticsQueryDefinition.builder()
                    .title("Trailing Average Encounter Billing Index")
                    .sql("""
                        SELECT 
                          encounter_id,
                          admitted_at,
                          billing_amount,
                          AVG(billing_amount) OVER (
                            PARTITION BY patient_id 
                            ORDER BY admitted_at 
                            ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
                          ) AS rolling_five_visit_avg_billing
                        FROM fact_encounters
                        ORDER BY patient_id, admitted_at;
                        """)
                    .description("Calculates sliding average values using ANSI SQL window functions to trace billing anomalies.")
                    .optimizationExplanation("Deploy a composite index on (patient_id, admitted_at, billing_amount) to allow index-only index-scan partitioning.")
                    .build());

            decisionText = "Window partitioning logic chosen.";
            reasoningText = "Using OVER (PARTITION BY) avoids repetitive self-joins for rolling aggregations, protecting CPU memory pools.";
        } else {
            // General business fallback
            queries.add(QueryDefinition.builder()
                    .title("Monthly Operational Event Performance Aggregations")
                    .sql("""
                        SELECT 
                          l.city,
                          DATE_TRUNC('month', f.event_timestamp) AS operation_month,
                          COUNT(*) AS total_activities,
                          AVG(f.raw_value) AS average_raw_yield
                        FROM fact_events f
                        JOIN dim_locations l ON f.location_id = l.location_id
                        GROUP BY 1, 2
                        ORDER BY 2 DESC, 3 DESC;
                        """)
                    .description("Calculates total operations count and average values by regional center.")
                    .columnsExpected(List.of("city", "operation_month", "total_activities", "average_raw_yield"))
                    .build());

            analyticsQueries.add(AnalyticsQueryDefinition.builder()
                    .title("Operational Window Trend Analytics")
                    .sql("""
                        SELECT 
                          event_id,
                          event_timestamp,
                          raw_value,
                          AVG(raw_value) OVER (
                            PARTITION BY profile_id 
                            ORDER BY event_timestamp 
                            ROWS BETWEEN 4 PRECEDING AND CURRENT ROW
                          ) AS rolling_avg_activity
                        FROM fact_events
                        ORDER BY profile_id, event_timestamp;
                        """)
                    .description("Aggregates rolling five activity scores via temporal window boundaries.")
                    .optimizationExplanation("Map indexes on event_timestamp to allow the execution planner to skip heavy sorting partitions.")
                    .build());

            decisionText = "CTE structures with window bounds utilized.";
            reasoningText = "Excluding subquery filters inside SELECT limits table scan cycles, speeding up execution paths.";
        }

        Reasoning reasoning = Reasoning.builder()
                .decision(decisionText)
                .reasoning(reasoningText)
                .assumptions(List.of(
                    "Standard primary keys automatically have clustered index mappings.",
                    "Date filter queries fit partition layouts."
                ))
                .alternatives(List.of(
                    "Database Materialized Views (limits real-time accuracy)",
                    "Web server application loops (wastes CPU/memory)"
                ))
                .confidenceScore(96)
                .build();

        return SqlResponse.builder()
                .queries(queries)
                .analyticsQueries(analyticsQueries)
                .reasoning(reasoning)
                .build();
    }
}
