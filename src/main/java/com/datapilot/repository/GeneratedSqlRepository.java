package com.datapilot.repository;

import com.datapilot.entity.GeneratedSql;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GeneratedSqlRepository extends JpaRepository<GeneratedSql, Long> {
    Optional<GeneratedSql> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);
}
