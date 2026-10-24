package com.fooderp.backend.production.repository;

import com.fooderp.backend.production.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    Optional<Recipe> findByCode(String code);
    List<Recipe> findByStatus(String status);
    List<Recipe> findByTargetProductId(UUID targetProductId);
    List<Recipe> findAllByOrderByCreatedAtDesc();
}
