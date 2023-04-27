package road.trip.api.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import road.trip.api.DAOs.Notification;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findNotificationsByNotifUsername(String username);
  Optional<Notification> findNotificationByNotifMsgAndNotifUsername(String msg, String username);
}
