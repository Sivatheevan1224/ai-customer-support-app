package com.support.ai.controller;

import com.support.ai.model.KnowledgeArticle;
import com.support.ai.service.KnowledgeBaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/knowledge-base")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    @GetMapping
    public ResponseEntity<List<KnowledgeArticle>> getAllArticles(@RequestParam(required = false) String query) {
        if (query != null && !query.trim().isEmpty()) {
            return ResponseEntity.ok(knowledgeBaseService.searchArticles(query));
        }
        return ResponseEntity.ok(knowledgeBaseService.getAllArticles());
    }

    @GetMapping("/published")
    public ResponseEntity<List<KnowledgeArticle>> getPublishedArticles() {
        return ResponseEntity.ok(knowledgeBaseService.getPublishedArticles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeArticle> getArticleById(@PathVariable Long id) {
        return knowledgeBaseService.getArticleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<KnowledgeArticle> createArticle(@RequestBody KnowledgeArticle article) {
        return ResponseEntity.status(HttpStatus.CREATED).body(knowledgeBaseService.createArticle(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeArticle> updateArticle(@PathVariable Long id, @RequestBody KnowledgeArticle articleDetails) {
        return ResponseEntity.ok(knowledgeBaseService.updateArticle(id, articleDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        knowledgeBaseService.deleteArticle(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<KnowledgeArticle> voteArticle(@PathVariable Long id, @RequestParam boolean isHelpful) {
        return ResponseEntity.ok(knowledgeBaseService.voteHelpful(id, isHelpful));
    }
}
