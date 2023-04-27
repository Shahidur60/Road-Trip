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
import road.trip.api.DAOs.Notification;
import road.trip.api.DAOs.Traveler;
import road.trip.api.RoadTripApplication;
import road.trip.api.Services.NotificationService;
import road.trip.api.Services.TravelerService;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertTrue;
@SpringBootTest(classes = RoadTripApplication.class)
@ContextConfiguration(initializers = ConfigFileApplicationContextInitializer.class)
@WebAppConfiguration
@RestController
public class NotificationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    NotificationService notificationService;

    @Autowired
    TravelerService travelerService;

    Traveler traveler;

    Notification notif;

    @BeforeEach
    public void setUp(){
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.webApplicationContext).build();

        // set up test dummy for traveler and trip before testing with stop
        traveler = new Traveler();
        traveler.setEmailAddress("test-traveler@test.com");
        traveler.setUsername("test0101");
        traveler.setPassword("t");
        travelerService.saveTraveler(traveler);
    }

    @Test
    public void createDeleteNotif(){
        notif = new Notification();

        notif.setNotifMsg("Test Notification");
        notif.setNotifUsername(traveler.getUsername());
        notif.setDate(new Date());

        notificationService.saveUserNotif(notif);

        // verify notif creation
        assertTrue(notificationService.getUserNotifications(notif.getNotifUsername()).contains(notif));

        notificationService.deleteNotif(notif.getId());
    }

   @Test
   public void verifyDays(){
        int days;

        notif = new Notification();

        notif.setNotifMsg("Test Notification");
        notif.setNotifUsername(traveler.getUsername());
        notif.setDate(new Date());

        notificationService.saveUserNotif(notif);

        days = NotificationService.daysBeforeAfterToday(notif.getDate());

        assertTrue(days < 1);

        notificationService.deleteNotif(notif.getId());
   }

    @AfterEach
    public void deleteTraveler(){
        travelerService.deleteTraveler(traveler.getId());
    }
}
