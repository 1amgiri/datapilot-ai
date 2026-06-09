package com.datapilot.repository;

import com.datapilot.entity.AnalysisHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AnalysisHistoryRepository extends JpaRepository<AnalysisHistory, Long> {
    Optional<AnalysisHistory> findFirstByProjectIdOrderByCreatedAtDesc(Long projectId);
}
