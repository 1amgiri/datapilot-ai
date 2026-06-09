package com.datapilot.agent;

import com.datapilot.dto.SchemaResponse;
import com.datapilot.dto.SqlResponse;

public interface SqlAgent {
    SqlResponse generateSql(String requirements, SchemaResponse schema);
}
