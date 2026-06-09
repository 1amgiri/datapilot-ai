package com.datapilot.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "generated_pipeline")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedPipeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "etl_steps_json", columnDefinition = "TEXT")
    private String etlStepsJson;

    @Column(name = "data_warehouse_design_json", columnDefinition = "TEXT")
    private String dataWarehouseDesignJson;

    @Column(name = "fabric_recommendation_json", columnDefinition = "TEXT")
    private String fabricRecommendationJson;

    @Column(name = "reasoning_json", columnDefinition = "TEXT")
    private String reasoningJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
