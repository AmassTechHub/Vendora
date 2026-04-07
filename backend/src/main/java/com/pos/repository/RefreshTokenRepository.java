package com.pos.repository;

import com.pos.model.RefreshToken;
import com.pos.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHashAndRevokedFalse(String tokenHash);
    void deleteByExpiresAtBefore(LocalDateTime cutoff);
    void deleteByUser(User user);
}
