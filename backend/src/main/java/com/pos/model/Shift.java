package com.pos.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shifts")
public class Shift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cashier_id", nullable = false)
    private User cashier;

    @Column(nullable = false)
    private LocalDateTime startTime = LocalDateTime.now();

    private LocalDateTime endTime;

    @Column(nullable = false)
    private BigDecimal openingCash;

    private BigDecimal closingCash;
    private BigDecimal expectedCash;
    private Integer totalSales = 0;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private BigDecimal cashRevenue = BigDecimal.ZERO;
    private String notes;

    @Enumerated(EnumType.STRING)
    private ShiftStatus status = ShiftStatus.ACTIVE;

    public enum ShiftStatus { ACTIVE, CLOSED }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCashier() { return cashier; }
    public void setCashier(User cashier) { this.cashier = cashier; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public BigDecimal getOpeningCash() { return openingCash; }
    public void setOpeningCash(BigDecimal openingCash) { this.openingCash = openingCash; }
    public BigDecimal getClosingCash() { return closingCash; }
    public void setClosingCash(BigDecimal closingCash) { this.closingCash = closingCash; }
    public BigDecimal getExpectedCash() { return expectedCash; }
    public void setExpectedCash(BigDecimal expectedCash) { this.expectedCash = expectedCash; }
    public Integer getTotalSales() { return totalSales; }
    public void setTotalSales(Integer totalSales) { this.totalSales = totalSales; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public BigDecimal getCashRevenue() { return cashRevenue; }
    public void setCashRevenue(BigDecimal cashRevenue) { this.cashRevenue = cashRevenue; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public ShiftStatus getStatus() { return status; }
    public void setStatus(ShiftStatus status) { this.status = status; }
}
