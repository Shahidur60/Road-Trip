package road.trip.api.Controllers;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.ConfigFileApplicationContextInitializer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import road.trip.api.DAOs.Stop;
import road.trip.api.DAOs.Traveler;
import road.trip.api.DAOs.Trip;
import road.trip.api.RoadTripApplication;
import road.trip.api.Services.StopService;
import road.trip.api.Services.TravelerService;
import road.trip.api.Services.TripService;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(classes = RoadTripApplication.class)
@ContextConfiguration(initializers = ConfigFileApplicationContextInitializer.class)
@WebAppConfiguration
@RestController
public class StopControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;
    private MockMvc mockMvc;

    @Autowired
    StopService stopService;

    @Autowired
    TripService tripService;

    @Autowired
    TravelerService travelerService;

    Stop stop;

    Traveler traveler;
    Trip trip;

    @BeforeEach
    public void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();

        // set up test dummy for traveler and trip before testing with stop
        traveler = new Traveler();
        traveler.setEmailAddress("test-traveler@test.com");
        traveler.setUsername("test0101");
        traveler.setPassword("t");
        travelerService.saveTraveler(traveler);

        trip = new Trip();
        trip.setTripRating(5);
        trip.setDate(new Date());
        trip.setStartLocation("Waco, TX, USA");
        trip.setEndLocation("Austin, TX, USA");
        trip.setTraveler(traveler);
        trip.setTripUsername(traveler.getUsername());
        tripService.saveTrip(trip);
    }

    @Test
    public void createDeleteStop() {
        stop = new Stop();
        stop.setStopLocation("Temple, TX, USA");
        stop.setStopRating(4);

        stopService.saveStop(stop);

        // verify stop creation
        assertTrue(stopService.findStop(stop.getId()).isPresent());

        // verify deletion
        stopService.deleteStop(stop.getId());
        assertTrue(stopService.findStop(stop.getId()).isEmpty());
    }

    @Test
    public void getAllStops() throws Exception{
        stop = new Stop();
        stop.setStopLocation("Temple, TX, USA");
        stop.setStopRating(4);

        stopService.saveStop(stop);

        this.mockMvc.perform(get("/stop/stops")).andDo(print())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$[0].stopLocation").isNotEmpty()).andReturn();
    }

    @Test
    public void getStopByStopId() throws Exception{
        stop = new Stop();
        stop.setStopLocation("Temple, TX, USA");
        stop.setStopRating(4);

        stopService.saveStop(stop);

        this.mockMvc.perform(get("/stop/id/{id}", stop.getId())).andDo(print())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.stopLocation").value("Temple, TX, USA")).andReturn();

        stopService.deleteStop(stop.getId());
    }

    @Test
    public void verifyStopTravID() throws Exception{
        stop = new Stop();
        stop.setStopLocation("Temple, TX, USA");
        stop.setStopRating(3);
        stop.setStopLongitude(-97.353287);
        stop.setStopLatitude(31.105862);
        stop.setStopUsername(traveler.getUsername());
        stopService.saveStop(stop);

        this.mockMvc.perform(get("/stop/id/{id}", stop.getId())).andDo(print())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.stopUsername").value(traveler.getUsername())).andReturn();

        stopService.deleteStop(stop.getId());

    }
    /*
    @ToDo work in progress for testing please do not modify
    @Test
    public void getStopsByTravelerId() throws Exception{
        // create multiple stops
        stop = new Stop();
        stop.setStopLocation("Temple, TX, USA");
        stop.setStopRating(4);

        Stop secondStop = new Stop();
        stop.setStopLocation("Killeen, TX, USA");
        stop.setStopRating(3);


        trip = new Trip();
        trip.setStartLocation("Waco, TX, USA");
        trip.setEndLocation("Austin, TX, USA");
        trip.setDate(new Date());
        trip.setTraveler(traveler);
        trip.setTripUsername(traveler.getUsername());


        //save multiple stops
        stopService.saveStop(stop);
        stopService.saveStop(secondStop);
        tripService.addStop(trip.getId(), stop);
        tripService.addStop(trip.getId(), secondStop);


        // assert that we now have 2 tests for this travelers id
        this.mockMvc.perform(get("/stop/stops/{username}", traveler.getUsername())).andDo(print())
                .andExpect(content().contentType("application/json"))
                .andExpect(jsonPath("$.*", hasSize(2))).andReturn();

        // delete trips
        stopService.deleteStop(stop.getId());
        stopService.deleteStop(secondStop.getId());

    }
    */

    @AfterEach
    public void deleteTraveler() {
        tripService.deleteTrip(trip.getId());
        travelerService.deleteTraveler(traveler.getId());
    }


}
