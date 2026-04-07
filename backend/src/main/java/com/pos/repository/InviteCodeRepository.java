package com.pos.repository;

import com.pos.model.InviteCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InviteCodeRepository extends JpaRepository<InviteCode, Long> {
    Optional<InviteCode> findByCodeIgnoreCase(String code);
    List<InviteCode> findTop100ByOrderByCreatedAtDesc();
}
