package com.datapilot.repository;

import com.datapilot.entity.GeneratedPipeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GeneratedPipelineRepository extends JpaRepository<GeneratedPipeline, Long> {
    Optional<GeneratedPipeline> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);
}
