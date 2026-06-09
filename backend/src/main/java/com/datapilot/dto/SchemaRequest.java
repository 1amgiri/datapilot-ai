package com.datapilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaRequest {
    @NotBlank(message = "Requirements text is required")
    private String requirements;
    
    @NotNull(message = "Requirement analysis response is required")
    private RequirementAnalysisResponse analysis;
}
