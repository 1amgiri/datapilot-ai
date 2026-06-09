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
public class SchemaResponse {
    private List<TableDefinition> tables;
    private List<RelationshipDefinition> relationships;
    private Reasoning reasoning;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableDefinition {
        private String name;
        private String description;
        private List<ColumnDefinition> columns;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ColumnDefinition {
        private String name;
        private String type;
        private List<String> constraints;
        private Boolean isPrimaryKey;
        private Boolean isForeignKey;
        private String referencesTable;
        private String referencesColumn;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipDefinition {
        private String fromTable;
        private String fromColumn;
        private String toTable;
        private String toColumn;
        private String type; // e.g. "one-to-many"
    }
}
