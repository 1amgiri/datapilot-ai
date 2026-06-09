-- DataPilot AI Database Schema DDL for MySQL
-- Created for Microsoft Agents League Hackathon Project MVP

-- Drop tables if they exist (clean setup, drops child tables first to avoid FK constraints issues)
DROP TABLE IF EXISTS chat_history;
DROP TABLE IF EXISTS generated_pipeline;
DROP TABLE IF EXISTS generated_sql;
DROP TABLE IF EXISTS generated_schema;
DROP TABLE IF EXISTS analysis_history;
DROP TABLE IF EXISTS project;

-- 1. Project Table
CREATE TABLE project (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    requirements TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Analysis History Table
CREATE TABLE analysis_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    business_goals_json TEXT,
    entities_json TEXT,
    metrics_json TEXT,
    constraints_json TEXT,
    reasoning_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_analysis_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

-- 3. Generated Schema Table
CREATE TABLE generated_schema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    tables_json TEXT,
    relationships_json TEXT,
    reasoning_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schema_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

-- 4. Generated SQL Table
CREATE TABLE generated_sql (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    queries_json TEXT,
    analytics_queries_json TEXT,
    reasoning_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sql_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

-- 5. Generated Pipeline Table
CREATE TABLE generated_pipeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    etl_steps_json TEXT,
    data_warehouse_design_json TEXT,
    fabric_recommendation_json TEXT,
    reasoning_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pipeline_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE CASCADE
);

-- 6. Chat History Table
CREATE TABLE chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    reasoning_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_project FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE SET NULL
);

-- Indices for performance
CREATE INDEX idx_analysis_history_project ON analysis_history(project_id);
CREATE INDEX idx_generated_schema_project ON generated_schema(project_id);
CREATE INDEX idx_generated_sql_project ON generated_sql(project_id);
CREATE INDEX idx_generated_pipeline_project ON generated_pipeline(project_id);
CREATE INDEX idx_chat_history_project ON chat_history(project_id);
