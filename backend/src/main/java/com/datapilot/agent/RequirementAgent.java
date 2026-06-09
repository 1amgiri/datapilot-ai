package com.datapilot.agent;

import com.datapilot.dto.RequirementAnalysisResponse;

public interface RequirementAgent {
    RequirementAnalysisResponse analyze(String requirements);
}
