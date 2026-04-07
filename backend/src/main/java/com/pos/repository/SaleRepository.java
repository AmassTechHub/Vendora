package com.pos.repository;

import com.pos.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Sale> findTop200ByOrderByCreatedAtDesc();

    @Query("SELECT s FROM Sale s WHERE s.cashier.id = :userId AND s.createdAt BETWEEN :start AND :end")
    List<Sale> findByCashierAndDateRange(@Param("userId") Long userId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);

    List<Sale> findByCustomerId(Long customerId);
}
