package com.support.ai.repository;

import com.support.ai.model.KnowledgeArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeArticleRepository extends JpaRepository<KnowledgeArticle, Long> {

    List<KnowledgeArticle> findByIsPublishedTrue();

    List<KnowledgeArticle> findByCategoryAndIsPublishedTrue(String category);

    @Query("SELECT k FROM KnowledgeArticle k WHERE k.isPublished = true AND " +
           "(LOWER(k.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(k.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(k.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<KnowledgeArticle> searchArticles(@Param("query") String query);
}
