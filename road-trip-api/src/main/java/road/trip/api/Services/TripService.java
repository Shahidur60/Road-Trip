package road.trip.api.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.webjars.NotFoundException;
import road.trip.api.DAOs.*;
import road.trip.api.Repositories.*;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TripService {
    @Autowired
    TravelerRepository travelerRepository;

    @Autowired
    TripRepository tripRepository;

    @Autowired
    StopRepository stopRepository;

    @Autowired
    NotificationRepository notificationRepository;

    public List<Trip> listAll() {return tripRepository.findAll();}

    public Optional<Trip> findTrip(Long id) { return tripRepository.findById(id); }

    public @ResponseBody String saveTrip(Trip trip){
        tripRepository.save(trip);
        return "Trip successfully created: " + trip;
    }

    public Trip rateTrip(Trip trip) {
        Trip foundTrip = tripRepository.findById(trip.getId()).orElse(null);

        if (foundTrip == null || trip.getTripRating() == null) {
            throw new NotFoundException("Invalid trip or rating given!");
        }

        foundTrip.setTripRating(trip.getTripRating());
        return tripRepository.save(foundTrip);
    }

    public List<Trip> getUserTrips(String username) {
        return tripRepository.findTripsByTripUsername(username);
    }


    public List<Trip> getUserAndFollowerTrips(String username) {
        List<Trip> yourTrips = new ArrayList<>(getUserTrips(username));

        for (Trip trip : yourTrips) {
            sendTripNotifications(trip, username);
        }

        Traveler curr = travelerRepository.findTravelerByUsername(username).get();
        Set<Traveler> following = new HashSet<>();

        // Get all travelers current is following
        List<Traveler> travelers = travelerRepository.findAll();
        for (Traveler traveler : travelers) {
            Optional<Traveler> followingTraveler = travelerRepository.findTravelerByIdAndFollowing(curr.getId(), traveler.getUsername());

            // Add these to following set
            // TODO: Inefficient! Fix this later!
            if (followingTraveler.isPresent()) {
                following.add(traveler);
            }
        }

        for (Traveler follow : following) {
            Set<Trip> followingTrips = follow.getTrips();

            // Send notifications about travelers your following
            for (Trip fTrip : followingTrips) {
                sendTripNotifications(fTrip, username);
            }

            yourTrips.addAll(follow.getTrips());
        }

        List<Trip> sortedTrips = yourTrips.stream().sorted(Comparator.comparing(Trip::getDate)).collect(Collectors.toList());

        return sortedTrips;
    }

    public Set<Stop> getFollowerStops(Long tripId) {
        Trip validTrip = findTrip(tripId).orElse(null);

        if (validTrip == null) {
            throw new NotFoundException("Trip not found!");
        }

        String startLoc = validTrip.getStartLocation();
        String endLoc = validTrip.getEndLocation();
        String username = validTrip.getTraveler().getUsername();

        Set<Stop> followerStops = new LinkedHashSet<>();
        List<Trip> followerTrips = new ArrayList<>(getUserAndFollowerTrips(username));

        for (Trip trip : followerTrips) {
            // Trips must share start & end locations
            if ((startLoc.equals(trip.getStartLocation()) && endLoc.equals(trip.getEndLocation())) ||
                    (startLoc.equals(trip.getEndLocation()) && endLoc.equals(trip.getStartLocation()))) {
                for (Stop stop : trip.getStops()) {
                    // Stops must be rated 3+ stars
                    if (stop.getStopRating() >= 3) {
                        followerStops.add(stop);
                    }
                }
            }
        }
        return followerStops;
    }

    public @ResponseBody Trip updateTrip(Trip newTrip){
        Optional<Trip> validTrip = tripRepository.findById(newTrip.getId());

        if(validTrip.isPresent()){
            Trip oldTrip = validTrip.get();

            newTrip.setId(oldTrip.getId());

            return tripRepository.save(newTrip);
        }

        throw new NotFoundException("Trip Not Found!");
    }

    public @ResponseBody String addStop(Long tripId, Stop stop) {
        Optional<Trip> getTrip = tripRepository.findById(tripId);

        if (getTrip.isPresent()) {
            Trip trip = getTrip.get();

            // Add new stop to the stops set
            trip.getStops().add(stop);

            tripRepository.save(trip);
            return "Stop successfully added: " + tripId;
        }

        throw new NotFoundException("Trip Not Found!");
    }

    public @ResponseBody String deleteAllTrips() {
        tripRepository.deleteAll();
        return "Trips successfully delete";
    }

    public String deleteTrip(Long tripId){
        tripRepository.deleteById(tripId);
        return "Trip successfully deleted: " + tripId;
    }

    public void sendTripNotifications(Trip trip, String username) {
        Notification newNotif = new Notification();
        String notifMsg = "";
        int daysBefore = NotificationService.daysBeforeAfterToday(trip.getDate());

        if (!trip.getTripUsername().equals(username) && daysBefore != 0) {
            return;
        }

        if (daysBefore == 0) {
            if (trip.getTripUsername().equals(username)) {
                notifMsg = "Your trip to " + trip.getEndLocation() + " is today! It's time to drive!!";
            } else {
                notifMsg = trip.getTripUsername() + " is going to " + trip.getEndLocation() + " today!";
            }
        } else if (daysBefore == -7) {
            notifMsg = "Your trip to " + trip.getEndLocation() + " is in 1 week! Getting excited?!";
        } else if (daysBefore == -7) {
            notifMsg = "Your trip to " + trip.getEndLocation() + " is in 1 month! Start prepping!!";
        } else {
            return; // Don't send a message
        }

        Optional<Notification> notifOpt = notificationRepository.findNotificationByNotifMsgAndNotifUsername(
                notifMsg, username);
        if (notifOpt.isPresent()) {
            Notification matchingNotif = notifOpt.get();
            int matchingDaysBefore = NotificationService.daysBeforeAfterToday(matchingNotif.getDate());

            if (matchingDaysBefore == daysBefore) {
                return; // Notification already exists (matching message, username, and date)
            }
        }

        newNotif.setNotifMsg(notifMsg);
        newNotif.setDate(new Date());
        newNotif.setNotifUsername(username);
        notificationRepository.save(newNotif);
    }

    public List<Trip> getTrendingTrips() {
        List<Trip> trendingTrips = new ArrayList<>();
        List<Trip> allTrips = tripRepository.findAll();

        for (Trip trip : allTrips) {
            int daysBefore = NotificationService.daysBeforeAfterToday(trip.getDate());

            // Is the trip within 3 days?
            if (daysBefore <= 0 && daysBefore > -3) {
                trendingTrips.add(trip);
            } else if (tripRepository.findTripsByStartLocation(trip.getStartLocation()).size() == 1) {
                // Trip has unique start location? Add it!
                trendingTrips.add(trip);
            } else if (tripRepository.findTripsByEndLocation(trip.getEndLocation()).size() == 1) {
                // Trip has unique end location? Add it!
                trendingTrips.add(trip);
            }
        }

        return trendingTrips;
    }

    public List<Trip> getTripRecommendations(String start, String end) {
        return tripRepository.findTripsByStartLocationAndEndLocation(start, end);
    }
}
