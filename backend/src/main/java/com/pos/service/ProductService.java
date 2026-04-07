package com.pos.service;

import com.pos.exception.ApiException;
import com.pos.model.Product;
import com.pos.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAll() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> search(String query) {
        return productRepository.findByNameContainingIgnoreCaseAndActiveTrue(query);
    }

    public Product getByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ApiException("Product not found with barcode: " + barcode, HttpStatus.NOT_FOUND));
    }

    public List<Product> getLowStock() {
        return productRepository.findByQuantityLessThanEqualAndActiveTrue(10);
    }

    public Product create(Product product) {
        if (product.getName() == null || product.getName().isBlank()) {
            throw new ApiException("Product name is required", HttpStatus.BAD_REQUEST);
        }
        if (product.getPrice() == null || product.getPrice().doubleValue() < 0) {
            throw new ApiException("Valid price is required", HttpStatus.BAD_REQUEST);
        }
        return productRepository.save(product);
    }

    public Product update(Long id, Product updated) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        product.setName(updated.getName());
        product.setCategory(updated.getCategory());
        product.setPrice(updated.getPrice());
        product.setQuantity(updated.getQuantity());
        product.setBarcode(updated.getBarcode());
        product.setSupplier(updated.getSupplier());
        product.setLowStockThreshold(updated.getLowStockThreshold());
        return productRepository.save(product);
    }

    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
        product.setActive(false);
        productRepository.save(product);
    }

    public Product adjustStock(Long id, Integer quantityChange) {
        if (quantityChange == null || quantityChange == 0) {
            throw new ApiException("Quantity change must be non-zero", HttpStatus.BAD_REQUEST);
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        int updatedQuantity = product.getQuantity() + quantityChange;
        if (updatedQuantity < 0) {
            throw new ApiException("Stock cannot be negative", HttpStatus.BAD_REQUEST);
        }

        product.setQuantity(updatedQuantity);
        return productRepository.save(product);
    }
}
