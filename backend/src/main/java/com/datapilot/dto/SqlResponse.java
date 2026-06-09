package com.datapilot.dto;

import com.datapilot.model.Reasoning;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SqlResponse {
    private List<QueryDefinition> queries;
    private List<AnalyticsQueryDefinition> analyticsQueries;
    private Reasoning reasoning;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QueryDefinition {
        private String title;
        private String sql;
        private String description;
        private List<String> columnsExpected;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalyticsQueryDefinition {
        private String title;
        private String sql;
        private String description;
        private String optimizationExplanation;
    }
}
