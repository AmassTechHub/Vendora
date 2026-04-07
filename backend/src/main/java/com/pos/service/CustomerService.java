package com.pos.service;

import com.pos.exception.ApiException;
import com.pos.model.Customer;
import com.pos.model.Sale;
import com.pos.repository.CustomerRepository;
import com.pos.repository.SaleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public CustomerService(CustomerRepository customerRepository, SaleRepository saleRepository) {
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
    }

    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    public List<Customer> search(String query) {
        return customerRepository.findByNameContainingIgnoreCase(query);
    }

    public List<Sale> getPurchaseHistory(Long customerId) {
        return saleRepository.findByCustomerId(customerId);
    }

    public Customer create(Customer customer) {
        if (customer.getName() == null || customer.getName().isBlank()) {
            throw new ApiException("Customer name is required", HttpStatus.BAD_REQUEST);
        }
        return customerRepository.save(customer);
    }

    public Customer update(Long id, Customer updated) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ApiException("Customer not found", HttpStatus.NOT_FOUND));
        customer.setName(updated.getName());
        customer.setPhone(updated.getPhone());
        customer.setEmail(updated.getEmail());
        customer.setAddress(updated.getAddress());
        return customerRepository.save(customer);
    }
}
