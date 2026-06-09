package com.datapilot.agent;

import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.PipelineResponse;

public interface PipelineAgent {
    PipelineResponse generatePipeline(String requirements, SchemaResponse schema);
}
