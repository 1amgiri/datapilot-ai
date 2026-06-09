package com.datapilot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_sql")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedSql {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "queries_json", columnDefinition = "TEXT")
    private String queriesJson;

    @Column(name = "analytics_queries_json", columnDefinition = "TEXT")
    private String analyticsQueriesJson;

    @Column(name = "reasoning_json", columnDefinition = "TEXT")
    private String reasoningJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
