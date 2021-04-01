package com.example.hivemvp;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseLoader implements CommandLineRunner {

    private final PhysicianRepository physicians;
    private final ManagerRepository managers;

    @Autowired
    public DatabaseLoader(PhysicianRepository physicianRepository,
                          ManagerRepository managerRepository) {
        this.physicians = physicianRepository;
        this.managers = managerRepository;
    }

    @Override
    public void run(String... strings) throws Exception {

        Manager cox = this.managers.save(new Manager("perry", "cox", "ROLE_MANAGER"));
        Manager kelso = this.managers.save(new Manager("bob", "kelso", "ROLE_MANAGER"));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("perry", "always mad",
                        AuthorityUtils.createAuthorityList("ROLE_MANAGER")));

        this.physicians.save(new Physician("Chris", "Turk", "Scrubs", cox));
        this.physicians.save(new Physician("John", "Dorian", "Scrubs", cox));

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("bob", "always evil",
                        AuthorityUtils.createAuthorityList("ROLE_MANAGER")));

        this.physicians.save(new Physician("Elliot", "Reid", "Scrubs", kelso));
        this.physicians.save(new Physician("Carla", "Espinoza", "Scrubs", kelso));

        SecurityContextHolder.clearContext();

    }

}
