package com.example.hivemvp;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.security.access.prepost.PreAuthorize;

/*
Interface with Physician Relational Database
 */
@PreAuthorize("hasRole('ROLE_MANAGER')")
public interface PhysicianRepository extends PagingAndSortingRepository<Physician, Long> {

    @Override
    @PreAuthorize("#physician?.manager == null or #physician?.manager?.name == authentication?.name")
    Physician save(@Param("physician") Physician physician);

    @Override
    @PreAuthorize("@physicianRepository.findById(#id)?.manager?.name == authentication?.name")
    void deleteById(@Param("id") Long id);

    @Override
    @PreAuthorize("#physician?.manager?.name == authentication?.name")
    void delete(@Param("physician") Physician physician);
}
