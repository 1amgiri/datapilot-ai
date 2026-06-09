package com.datapilot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FullAnalysisResponse {
    private Long projectId;
    private String requirements;
    private RequirementAnalysisResponse analysis;
    private SchemaResponse schema;
    private SqlResponse sql;
    private PipelineResponse pipeline;
}
