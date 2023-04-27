package road.trip.api.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import road.trip.api.DAOs.Stop;

import java.util.Optional;

@Repository
public interface StopRepository extends JpaRepository<Stop, Long> {
  Optional<Stop> findStopByStopLocation(String locationName);

}