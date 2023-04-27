package road.trip.api.Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.ConfigFileApplicationContextInitializer;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.WebApplicationContext;
import road.trip.api.Configs.JwtUtil;
import road.trip.api.DAOs.Traveler;
import road.trip.api.DAOs.Trip;
import road.trip.api.RoadTripApplication;
import road.trip.api.Services.TravelerService;
import road.trip.api.Services.TripService;

import java.util.Date;
import java.util.Optional;

import static java.lang.Long.parseLong;
import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = RoadTripApplication.class)
@ContextConfiguration(initializers = ConfigFileApplicationContextInitializer.class)
@WebAppConfiguration
@RestController
public class TripControllerTest {
  @Autowired
  private WebApplicationContext webApplicationContext;
  private MockMvc mockMvc;

  @Autowired
  TripService tripService;

  @Autowired
  TravelerService travelerService;

  String token;
  Trip trip;
  Traveler traveler;

  @BeforeEach
  public void setUp() {
    this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();

    traveler = new Traveler();
    traveler.setEmailAddress("test-traveler@test.com");
    traveler.setUsername("test0101");
    traveler.setPassword("t");

    token = travelerService.saveTraveler(traveler);
  }

  @Test
  public void createDeleteTrip() {
    trip = new Trip();

    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTraveler(traveler);

    tripService.saveTrip(trip);

    // Verify trip creation
    assertTrue(tripService.findTrip(trip.getId()).isPresent());

    // Verify deletion
    tripService.deleteTrip(trip.getId());
    assertTrue(tripService.findTrip(trip.getId()).isEmpty());
  }

    @Test
  public void getAllTrips() throws Exception{
      trip = new Trip();
      trip.setStartLocation("Waco, TX, USA");
      trip.setEndLocation("Austin, TX, USA");
      trip.setDate(new Date());
      trip.setTraveler(traveler);

    tripService.saveTrip(trip);

    this.mockMvc.perform(get("/trip/trips")).andDo(print())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$[0].startLocation").isNotEmpty()).andReturn();

    tripService.deleteTrip(trip.getId());
  }

  @Test
  public void getTripByTripId() throws Exception{
    trip = new Trip();
    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTraveler(traveler);

    tripService.saveTrip(trip);

    this.mockMvc.perform(get("/trip/id/{id}", trip.getId())).andDo(print())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.startLocation").value("Waco, TX, USA")).andReturn();

    tripService.deleteTrip(trip.getId());
  }

  @Test
  public void getTripsByTravelerUsername() throws Exception{
    // create multiple trips
    trip = new Trip();
    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTraveler(traveler);
    trip.setTripUsername(traveler.getUsername());

    Trip secondTrip = new Trip();
    secondTrip.setStartLocation("Austin, TX, USA");
    secondTrip.setEndLocation("Waco, TX, USA");
    secondTrip.setDate(new Date());
    secondTrip.setTraveler(traveler);
    secondTrip.setTripUsername(traveler.getUsername());

    // save multiple trips
    tripService.saveTrip(trip);
    tripService.saveTrip(secondTrip);

    // assert that we now have 2 tests for this travelers id
    this.mockMvc.perform(get("/trip/your-trips/{username}", traveler.getUsername())).andDo(print())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.*", hasSize(2))).andReturn();

    // delete trips
    tripService.deleteTrip(trip.getId());
    tripService.deleteTrip(secondTrip.getId());

  }

  @Test
  public void addTrip() throws Exception{
    trip = new Trip();
    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTraveler(traveler);
    trip.setTripUsername(traveler.getUsername());

    ObjectMapper om = new ObjectMapper();
    String jsonTrav = om.writeValueAsString(traveler);

    MvcResult result = this.mockMvc.perform(post("/trip/add/{token}", token).contentType(MediaType.APPLICATION_JSON_UTF8)
                    .content("{ \"startLocation\": \"" + trip.getStartLocation() +
                            "\", \"endLocation\": \"" + trip.getEndLocation() +
                            "\", \"duration\": \"" + trip.getDuration() +
                            "\", \"distance\": \"" + trip.getDistance() +
                            "\", \"date\": \"" + trip.getDate().getTime() +
                            "\", \"tripUsername\": \"" + trip.getTripUsername() +
                            "\", \"traveler\": " + jsonTrav + " }")).andDo(print())
            .andExpect(status().isOk()).andReturn();

    int begIdx = result.getResponse().getContentAsString().indexOf("=");
    int endIdx = result.getResponse().getContentAsString().indexOf(",");
    String id = result.getResponse().getContentAsString().substring(begIdx + 1, endIdx);

    trip.setId(parseLong(id));

    tripService.deleteTrip(trip.getId());

  }

  @Test
  public void verifyTripRecommendation() throws Exception{
    trip = new Trip();
    trip.setStartLocation("Paris, TX, USA");
    trip.setEndLocation("Prague, TX, USA");
    trip.setDate(new Date());
    trip.setTripRating(5);
    trip.setTraveler(traveler);
    trip.setTripUsername(traveler.getUsername());

    tripService.saveTrip(trip);

    System.out.println(trip.getStartLocation());

    // assert that we have a size of 1 from searching the start and end location
    this.mockMvc.perform(get("/trip/trips/{start}/{end}", trip.getStartLocation(), trip.getEndLocation()))
            .andDo(print())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.*", hasSize(1))).andReturn();

    tripService.deleteTrip(trip.getId());
  }

  @Test
  public void updateTrip() throws Exception{
    trip = new Trip();
    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTripRating(5);
    trip.setTraveler(traveler);
    trip.setTripUsername(traveler.getUsername());

    tripService.saveTrip(trip);

    trip.setStartLocation("Houston, TX, USA");
    trip.setTripRating(3);

    ObjectMapper om = new ObjectMapper();
    String jsonTrav = om.writeValueAsString(traveler);

    this.mockMvc.perform(put("/trip/update/{token}", token).contentType(MediaType.APPLICATION_JSON_UTF8)
                    .content("{ \"id\": \"" + trip.getId() +
                            "\", \"startLocation\": \"" + trip.getStartLocation() +
                            "\", \"endLocation\": \"" + trip.getEndLocation() +
                            "\", \"duration\": \"" + trip.getDuration() +
                            "\", \"distance\": \"" + trip.getDistance() +
                            "\", \"date\": \"" + trip.getDate().getTime() +
                            "\", \"tripRating\": \"" + trip.getTripRating() +
                            "\", \"tripUsername\": \"" + trip.getTripUsername() +
                            "\", \"traveler\": " + jsonTrav + " }")).andDo(print())
            .andExpect(status().isOk()).andReturn();

    Optional<Trip> changedTrip = tripService.findTrip(trip.getId());

   assertTrue(changedTrip.get().getStartLocation().equals("Houston, TX, USA"));
   assertTrue(changedTrip.get().getTripRating().equals(3));

    tripService.deleteTrip(trip.getId());
  }

  @Test
  public void deleteTrip() throws Exception {
    trip = new Trip();
    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTraveler(traveler);
    trip.setTripUsername(traveler.getUsername());

    tripService.saveTrip(trip);

    this.mockMvc.perform(delete("/trip/delete/{token}/{tripId}", token, trip.getId())).andReturn();

    assertTrue(tripService.findTrip(trip.getId()).isEmpty());

  }

  @Test
  public void verifyTripTravUsername() throws Exception {
    trip = new Trip();
    trip.setStartLocation("Waco, TX, USA");
    trip.setEndLocation("Austin, TX, USA");
    trip.setDate(new Date());
    trip.setTraveler(traveler);
    trip.setTripUsername(traveler.getUsername());

    tripService.saveTrip(trip);

    this.mockMvc.perform(get("/trip/id/{id}", trip.getId())).andDo(print())
            .andExpect(content().contentType("application/json"))
            .andExpect(jsonPath("$.tripUsername").value(traveler.getUsername())).andReturn();

    tripService.deleteTrip(trip.getId());
  }

  @AfterEach
  public void deleteTraveler() {
    travelerService.deleteTraveler(traveler.getId());
  }
}
