package com.datapilot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_schema")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedSchema {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "tables_json", columnDefinition = "TEXT")
    private String tablesJson;

    @Column(name = "relationships_json", columnDefinition = "TEXT")
    private String relationshipsJson;

    @Column(name = "reasoning_json", columnDefinition = "TEXT")
    private String reasoningJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
