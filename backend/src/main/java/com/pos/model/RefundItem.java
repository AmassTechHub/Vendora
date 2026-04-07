package com.pos.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "refund_items")
public class RefundItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "refund_id")
    private Refund refund;

    @ManyToOne
    @JoinColumn(name = "sale_item_id")
    private SaleItem saleItem;

    private Integer quantity;
    private BigDecimal refundAmount;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Refund getRefund() { return refund; }
    public void setRefund(Refund refund) { this.refund = refund; }
    public SaleItem getSaleItem() { return saleItem; }
    public void setSaleItem(SaleItem saleItem) { this.saleItem = saleItem; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public void setRefundAmount(BigDecimal refundAmount) { this.refundAmount = refundAmount; }
}
