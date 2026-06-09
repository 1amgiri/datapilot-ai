# DataPilot AI - API Specification

REST API endpoints exposed by the Spring Boot backend service on port `8080`.

## Endpoints

### 1. Step 1: Requirement Analysis
*   **Path**: `POST /api/v1/analyze`
*   **Request Model (`AnalysisRequest`)**:
    ```json
    {
      "requirements": "I run an e-commerce company and need monthly sales analytics."
    }
    ```
*   **Response Model (`RequirementAnalysisResponse`)**:
    ```json
    {
      "businessGoals": ["Track multi-channel transactions"],
      "entities": [{"name": "Order", "description": "Transaction logs", "keyAttributes": ["id", "gross_amount"]}],
      "metrics": [{"name": "Net Yield", "calculationLogic": "SUM(gross) - SUM(refunds)", "targetKPIs": ["> $1M"]}],
      "constraints": ["Normalized to USD"],
      "reasoning": {
        "decision": "Star Schema chosen",
        "reasoning": "Fits analytical workload",
        "assumptions": ["UTC timezones"],
        "alternatives": ["NoSQL Document Model"],
        "confidenceScore": 95
      }
    }
    ```

### 2. Step 2: Relational Schema Generation
*   **Path**: `POST /api/v1/schema`
*   **Request Model (`SchemaRequest`)**
*   **Response Model (`SchemaResponse`)**

### 3. Step 3: Analytical SQL Generation
*   **Path**: `POST /api/v1/sql`
*   **Request Model (`SqlRequest`)**
*   **Response Model (`SqlResponse`)**

### 4. Step 4: ETL Pipeline Advice
*   **Path**: `POST /api/v1/pipeline`
*   **Request Model (`PipelineRequest`)**
*   **Response Model (`PipelineResponse`)**

### 5. Full Pipeline Orchestration
*   **Path**: `POST /api/v1/full-analysis`
*   **Request Model (`AnalysisRequest`)**
*   **Response Model (`FullAnalysisResponse`)**

### 6. Copilot Chat
*   **Path**: `POST /api/v1/chat`
*   **Request Model (`ChatRequest`)**
*   **Response Model (`ChatResponse`)**
