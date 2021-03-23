package com.example.hivemvp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseLoader implements CommandLineRunner {

    private final PhysicianRepository repository;

    @Autowired
    public DatabaseLoader(PhysicianRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... strings) throws Exception {
        this.repository.save(new Physician("Richard", "Bucholz", "Neurology"));
    }
   
}
