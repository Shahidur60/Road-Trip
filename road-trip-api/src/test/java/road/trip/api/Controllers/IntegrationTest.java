package road.trip.api.Controllers;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.ConfigFileApplicationContextInitializer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import road.trip.api.DAOs.Traveler;
import road.trip.api.DAOs.Trip;
import road.trip.api.RoadTripApplication;
import road.trip.api.Services.TravelerService;
import road.trip.api.Services.TripService;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = RoadTripApplication.class)
@ContextConfiguration(initializers = ConfigFileApplicationContextInitializer.class)
@WebAppConfiguration
@RestController
public class IntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;
    private MockMvc mockMvc;

    @Autowired
    TripService tripService;
    @Autowired
    TravelerService travelerService;

    Trip trip;
    Traveler traveler;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();

        traveler = new Traveler();
        traveler.setEmailAddress("test-traveler@test.com");
        traveler.setBio("");
        traveler.setFirstName("Test");
        traveler.setPassword("password");
        traveler.setLastName("Traveler");
        traveler.setUsername("test101Trav");
        travelerService.saveTraveler(traveler);
    }

    @Test
    public void addTripToTraveler(){
        trip = new Trip();
        trip.setStartLocation("Waco, TX, USA");
        trip.setEndLocation("Austin, TX, USA");
        trip.setDate(new Date());
        trip.setTraveler(traveler);
        trip.setTripUsername(traveler.getUsername());

        tripService.saveTrip(trip);

        assertTrue(tripService.getUserTrips(traveler.getUsername()).size() == 1);

        tripService.deleteTrip(trip.getId());
    }

    @Test
    public void modifyTravelerTrip(){
        trip = new Trip();
        trip.setStartLocation("Waco, TX, USA");
        trip.setEndLocation("Austin, TX, USA");
        trip.setDate(new Date());
        trip.setTraveler(traveler);
        trip.setTripUsername(traveler.getUsername());

        tripService.saveTrip(trip);

        trip.setEndLocation("Houston, TX, USA");

        tripService.updateTrip(trip);


        assertTrue(tripService.getUserTrips(travelerService.findTravelerByEmail("test-traveler@test.com").get()
                .getUsername()).get(0).getEndLocation().equals("Houston, TX, USA"));

        tripService.deleteTrip(trip.getId());

    }


    @AfterEach
    public void deleteTraveler() {
        travelerService.deleteTraveler(traveler.getId());
    }
}
