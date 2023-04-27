package road.trip.api.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import road.trip.api.DAOs.Trip;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
  List<Trip> findTripsByTripUsername(String username);
  List<Trip> findTripsByStartLocation(String startLocation);
  List<Trip> findTripsByEndLocation(String endLocation);
  List<Trip> findTripsByStartLocationAndEndLocation(String start, String end);
}

