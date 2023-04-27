package road.trip.api.DAOs;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.*;
import java.util.Date;
import java.util.Objects;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Entity
@Table(name = Notification.TABLE_NAME)
public class Notification {
  public static final String TABLE_NAME = "NOTIFICATION";

  @Id
  @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
  @SequenceGenerator(
          name = TABLE_NAME + "_GENERATOR",
          sequenceName = TABLE_NAME + "_SEQUENCE"
  )
  @Column(name = "NOTIF_ID")
  private Long id;

  @Column(name = "NOTIF_MSG")
  private String notifMsg;

  @Column(name = "GEN_DATE")
  private Date date;

  @Column(name = "NOTIF_USRNAME")
  private String notifUsername;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Notification that = (Notification) o;
    return Objects.equals(id, that.id) && Objects.equals(notifMsg, that.notifMsg) && Objects.equals(notifUsername, that.notifUsername);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, notifMsg, date, notifUsername);
  }
}
