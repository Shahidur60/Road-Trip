package road.trip.api.Controllers;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.webjars.NotFoundException;
import road.trip.api.Configs.JwtUtil;
import road.trip.api.DAOs.Playlist;
import road.trip.api.DAOs.Stop;
import road.trip.api.DAOs.Trip;
import road.trip.api.Services.TripService;

import java.util.List;
import java.util.Set;

@Log4j2
@RestController
@CrossOrigin(origins={"http://localhost:3000",
        "http://triphala.tk:3000",
        "http://triphala.tk:80",
        "http://triphala.tk",
        "https://triphala.tk"}, maxAge = 3600)
@RequestMapping(value = "trip")
public class TripController {
    @Autowired
    TripService tripService;

    @Autowired
    JwtUtil jwtUtil;

    @GetMapping("/trips")
    public List<Trip> showTripList(Model model){
        List<Trip> listTrips = tripService.listAll();
        model.addAttribute("listTrips", listTrips);
        return listTrips;
    }

    @GetMapping("/id/{id}")
    public Trip findTripById(@PathVariable Long id) {
        return tripService.findTrip(id).orElse(null);
    }

    @GetMapping("/your-trips/{username}")
    public List<Trip> findUserTripsByUsername (@PathVariable String username){
        return tripService.getUserTrips(username);
    }

    @GetMapping("/follower-trips/{username}")
    public List<Trip> findUserFollowerTripsByUsername (@PathVariable String username){
        return tripService.getUserAndFollowerTrips(username);
    }

    @GetMapping("/trips/{start}/{end}")
    public List<Trip> getTripRecommendations (@PathVariable String start, @PathVariable String end){
        return tripService.getTripRecommendations(start, end);
    }

    @GetMapping("/follower-stops/{tripId}")
    public Set<Stop> getFollowerStops(@PathVariable Long tripId) {
        return tripService.getFollowerStops(tripId);
    }

    @GetMapping("/popular-trips")
    public List<Trip> getPopularTrips() {
        return tripService.getTrendingTrips();
    }

    @PostMapping("/add/{token}")
    public @ResponseBody String createTrip(@PathVariable String token, @RequestBody Trip trip) {
        String username = jwtUtil.extractUsername(token);

        if (!trip.getTripUsername().equals(username)) {
            throw new NotFoundException("Invalid token provided.");
        }

        return tripService.saveTrip(trip);
    }

    @PutMapping("/update/{token}")
    public @ResponseBody Trip updateTrip(@PathVariable String token, @RequestBody Trip trip) {
        String username = jwtUtil.extractUsername(token);

        if (!trip.getTripUsername().equals(username)) {
            throw new NotFoundException("Invalid token provided.");
        }

        return tripService.updateTrip(trip);
    }

    @PutMapping("/{token}/add-stop/{tripId}")
    public @ResponseBody String addStop(@PathVariable String token,
                                        @PathVariable Long tripId, @RequestBody Stop stop) {
        String username = jwtUtil.extractUsername(token);
        Trip trip = tripService.findTrip(tripId).orElse(null);

        if (trip == null) {
            throw new NotFoundException("Trip not found.");
        }

        if (!trip.getTripUsername().equals(username)) {
            throw new NotFoundException("Invalid token provided.");
        }

        return tripService.addStop(tripId, stop);
    }

    @PostMapping("/rate/{token}")
    public Trip rateTrip(@PathVariable String token, @RequestBody Trip trip) {
        String username = jwtUtil.extractUsername(token);
        Trip currTrip = tripService.findTrip(trip.getId()).orElse(null);

        if (currTrip == null) {
            throw new NotFoundException("Trip not found.");
        }

        if (!currTrip.getTripUsername().equals(username)) {
            throw new NotFoundException("Invalid token provided.");
        }

        return tripService.rateTrip(trip);
    }

    @DeleteMapping("/delete/{token}/{tripId}")
    public @ResponseBody String deleteTrip(@PathVariable String token, @PathVariable Long tripId) {
        String username = jwtUtil.extractUsername(token);
        Trip trip = tripService.findTrip(tripId).orElse(null);

        if (trip == null) {
            throw new NotFoundException("Invalid trip provided.");
        }

        if (!trip.getTripUsername().equals(username)) {
            throw new NotFoundException("Invalid token provided.");
        }

        return tripService.deleteTrip(tripId);
    }
}

