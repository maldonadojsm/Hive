package com.example.hivemvp;

import org.springframework.data.repository.CrudRepository;

/*
Interface with Physician Relational Database
 */
public interface PhysicianRepository extends CrudRepository<Physician, Long> {
}
