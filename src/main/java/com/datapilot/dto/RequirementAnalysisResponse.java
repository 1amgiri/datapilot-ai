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
public class RequirementAnalysisResponse {
    private List<String> businessGoals;
    private List<EntityDefinition> entities;
    private List<MetricDefinition> metrics;
    private List<String> constraints;
    private Reasoning reasoning;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EntityDefinition {
        private String name;
        private String description;
        private List<String> keyAttributes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetricDefinition {
        private String name;
        private String calculationLogic;
        private List<String> targetKPIs;
    }
}
