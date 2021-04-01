package com.example.hivemvp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Objects;

/*
Physician Java Bean
 */
@Entity
public class Physician {

    private @Id
    @GeneratedValue
    Long id;
    private String firstName;
    private String lastName;
    private String specialty;
    private @Version
    @JsonIgnore
    Long version;

    private @ManyToOne
    Manager manager;

    public Physician() {
    }

    public Physician(String firstName, String lastName, String specialty, Manager manager) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.specialty = specialty;
        this.manager = manager;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Physician physician = (Physician) o;
        return Objects.equals(id, physician.id) &&
                Objects.equals(firstName, physician.firstName) &&
                Objects.equals(lastName, physician.lastName) &&
                Objects.equals(specialty, physician.specialty) &&
                Objects.equals(version, physician.version) &&
                Objects.equals(manager, physician.manager);
    }

    @Override
    public String toString() {
        return "Physician{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", specialty='" + specialty + '\'' +
                ", version='" + version +
                ", manager='" + manager +
                '}';
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, firstName, lastName, specialty, version, manager);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public Manager getManager() {
        return manager;
    }

    public void setManager(Manager manager) {
        this.manager = manager;
    }
}
