package com.pos.repository;

import com.pos.model.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findAllByOrderByStartTimeDesc();
    Optional<Shift> findTopByCashierUsernameAndStatusOrderByStartTimeDesc(String username, Shift.ShiftStatus status);
    Optional<Shift> findTopByStatusOrderByStartTimeDesc(Shift.ShiftStatus status);
    List<Shift> findByCashierUsernameOrderByStartTimeDesc(String username);
}
