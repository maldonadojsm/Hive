package com.example.hivemvp;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

/*
Interface with Physician Relational Database
 */
public interface PhysicianRepository extends PagingAndSortingRepository<Physician, Long> {
}
