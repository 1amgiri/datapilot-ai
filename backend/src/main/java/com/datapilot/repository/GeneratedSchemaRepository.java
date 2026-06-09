package com.datapilot.repository;

import com.datapilot.entity.GeneratedSchema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GeneratedSchemaRepository extends JpaRepository<GeneratedSchema, Long> {
    Optional<GeneratedSchema> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);
}
