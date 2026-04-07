package com.pos.repository;

import com.pos.model.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    List<Refund> findAllByOrderByCreatedAtDesc();
    List<Refund> findBySaleIdOrderByCreatedAtDesc(Long saleId);
}
