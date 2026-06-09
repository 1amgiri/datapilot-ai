package com.datapilot.agent;

import com.datapilot.dto.RequirementAnalysisResponse;
import com.datapilot.dto.SchemaResponse;

public interface SchemaAgent {
    SchemaResponse generateSchema(String requirements, RequirementAnalysisResponse analysis);
}
