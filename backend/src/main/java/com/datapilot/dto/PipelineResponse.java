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
public class PipelineResponse {
    private List<EtlStep> etlSteps;
    private DataWarehouseDesign dataWarehouseDesign;
    private FabricRecommendation fabricRecommendation;
    private Reasoning reasoning;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EtlStep {
        private String step;
        private String source;
        private String target;
        private String transformation;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataWarehouseDesign {
        private String modelType;
        private String brief;
        private List<String> facts;
        private List<String> dimensions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FabricRecommendation {
        private List<String> componentsRecommended;
        private String integrationFlow;
        private String ingestionLayer;
        private String analyticsLayer;
        private String powerBiIntegration;
    }
}
