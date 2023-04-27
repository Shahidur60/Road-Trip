package road.trip.api.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import road.trip.api.DAOs.Notification;
import road.trip.api.Repositories.NotificationRepository;

import java.time.*;
import java.util.Date;
import java.util.List;

@Service
public class NotificationService {

  public static int daysBeforeAfterToday(Date date) {
    // Parse date into local date
    Instant instant = date.toInstant();
    ZonedDateTime dateTime = instant.atZone(ZoneId.systemDefault());
    LocalDate notifDateLocal = dateTime.toLocalDate();

    // Calculate period between date and current date
    Period period = Period.between(notifDateLocal, LocalDate.now());

    // Positive if date before today, negative if after
    return period.getDays();
  }

  @Autowired
  NotificationRepository notificationRepository;

  public List<Notification> getUserNotifications(String username) {
    List<Notification> userNotifs = notificationRepository.findNotificationsByNotifUsername(username);

    // Iterate through user notifications
    for (Notification notification : userNotifs ) {
      // Notification older than 5 days?
      if (NotificationService.daysBeforeAfterToday(notification.getDate()) > 5) {
        notificationRepository.delete(notification);
      }
    }

    // Get notifications again after deleting old ones
    userNotifs = notificationRepository.findNotificationsByNotifUsername(username);

    return userNotifs;
  }

  public Notification saveUserNotif(Notification notification) {
    return notificationRepository.save(notification);
  }

  public String deleteNotif(Long id){
    notificationRepository.deleteById(id);
    return "Successfully Deleted";
  }
}
