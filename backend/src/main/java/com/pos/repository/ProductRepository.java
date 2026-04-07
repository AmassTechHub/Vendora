package com.pos.repository;

import com.pos.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByBarcode(String barcode);
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
    List<Product> findByActiveTrue();
    List<Product> findByQuantityLessThanEqualAndActiveTrue(Integer threshold);
}
