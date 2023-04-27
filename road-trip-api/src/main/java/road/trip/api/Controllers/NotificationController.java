package road.trip.api.Controllers;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import road.trip.api.DAOs.Notification;
import road.trip.api.Services.NotificationService;

import java.util.List;

@Log4j2
@RestController
@CrossOrigin(origins={"http://localhost:3000",
        "http://triphala.tk:3000",
        "http://triphala.tk:80",
        "http://triphala.tk",
        "https://triphala.tk"}, maxAge = 3600)
@RequestMapping(value = "notification")
public class NotificationController {
  @Autowired
  NotificationService notificationService;

  @GetMapping("/notifications/{username}")
  public List<Notification> getUserNotifications(@PathVariable String username) {
    return notificationService.getUserNotifications(username);
  }
}
