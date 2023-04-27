package road.trip.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import road.trip.api.DAOs.Traveler;
import road.trip.api.Repositories.TravelerRepository;

@SpringBootApplication()
@EnableJpaRepositories
public class RoadTripApplication {
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(RoadTripApplication.class, args);

        // Initialize admin account
        Traveler traveler = context.getBean(TravelerRepository.class).findTravelerByUsername("admin").orElse(null);
        if (traveler == null) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

            context.getBean(TravelerRepository.class).save(
                    new Traveler("admin", "admin@triphala.tk", passwordEncoder.encode("123"), 'Y'));
        }
    }
}