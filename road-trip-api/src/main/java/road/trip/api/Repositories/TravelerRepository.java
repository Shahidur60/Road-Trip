package road.trip.api.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import road.trip.api.DAOs.Traveler;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface TravelerRepository extends JpaRepository<Traveler, Long> {
    Optional<Traveler> findTravelerByEmailAddress(String emailAddress);

    Optional<Traveler> findTravelerByUsername(String username);

    Optional<Traveler> findTravelerByUsernameAndPassword(String username, String password);

    Optional<Traveler> findTravelerByIdAndFollowing(Long id, String followUsername);

    Optional<Traveler> findTravelerByIdAndFollowers(Long id, String followUsername);

    Optional<Traveler> findTravelerByUsernameAndIsAdmin(String username, Character isAdmin);
}
