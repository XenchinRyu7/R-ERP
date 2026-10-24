package com.fooderp.backend.auth.repository;

import com.fooderp.backend.auth.entity.AppUser;
import com.fooderp.backend.auth.entity.UserRole;
import com.fooderp.backend.auth.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByUsername(String username);
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByUsernameOrEmail(String username, String email);
    List<AppUser> findByRole(UserRole role);
    List<AppUser> findByStatus(UserStatus status);
    List<AppUser> findAllByOrderByCreatedAtDesc();
}
