package com.pos.repository;

import com.pos.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findAllByOrderByDateDescCreatedAtDesc();
    List<Expense> findByCategoryOrderByDateDesc(String category);
    List<Expense> findByDateBetweenOrderByDateDesc(LocalDate from, LocalDate to);
    List<Expense> findByCategoryAndDateBetweenOrderByDateDesc(String category, LocalDate from, LocalDate to);
}
