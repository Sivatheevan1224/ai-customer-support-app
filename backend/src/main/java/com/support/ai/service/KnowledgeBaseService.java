package com.support.ai.service;

import com.support.ai.model.KnowledgeArticle;
import com.support.ai.repository.KnowledgeArticleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KnowledgeBaseService {

    private final KnowledgeArticleRepository articleRepository;

    public List<KnowledgeArticle> getAllArticles() {
        return articleRepository.findAll();
    }

    public List<KnowledgeArticle> getPublishedArticles() {
        return articleRepository.findByIsPublishedTrue();
    }

    public Optional<KnowledgeArticle> getArticleById(Long id) {
        return articleRepository.findById(id).map(article -> {
            article.setViewsCount(article.getViewsCount() + 1);
            return articleRepository.save(article);
        });
    }

    public KnowledgeArticle createArticle(KnowledgeArticle article) {
        return articleRepository.save(article);
    }

    public KnowledgeArticle updateArticle(Long id, KnowledgeArticle articleDetails) {
        KnowledgeArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + id));

        article.setTitle(articleDetails.getTitle());
        article.setContent(articleDetails.getContent());
        article.setCategory(articleDetails.getCategory());
        article.setTags(articleDetails.getTags());
        if (articleDetails.getIsPublished() != null) {
            article.setIsPublished(articleDetails.getIsPublished());
        }
        return articleRepository.save(article);
    }

    public void deleteArticle(Long id) {
        articleRepository.deleteById(id);
    }

    public List<KnowledgeArticle> searchArticles(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getPublishedArticles();
        }
        return articleRepository.searchArticles(query.trim());
    }

    public KnowledgeArticle voteHelpful(Long id, boolean isHelpful) {
        KnowledgeArticle article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + id));

        if (isHelpful) {
            article.setHelpfulVotes(article.getHelpfulVotes() + 1);
        } else {
            article.setUnhelpfulVotes(article.getUnhelpfulVotes() + 1);
        }
        return articleRepository.save(article);
    }
}
