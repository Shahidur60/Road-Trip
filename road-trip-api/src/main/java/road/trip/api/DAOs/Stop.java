package road.trip.api.DAOs;

import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.*;
import java.util.*;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Entity
@Table(name = Stop.TABLE_NAME)
public class Stop {
  public static final String TABLE_NAME = "STOP";

  @Id
  @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
  @SequenceGenerator(
          name = TABLE_NAME + "_GENERATOR",
          sequenceName = TABLE_NAME + "_SEQUENCE"
  )
  @Column(name = "STOP_ID")
  private Long id;

  @Column(name = "STOP_LOCATION")
  private String stopLocation;

  @Column(name = "STOP_RATING")
  private Integer stopRating;

  @Column(name = "STOP_LONGITUDE")
  private Double stopLongitude;

  @Column(name = "STOP_LATITUDE")
  private Double stopLatitude;

  @Column(name = "STOP_DISTANCE")
  private Integer stopDistance;

  @Column(name = "STOP_USERNAME")
  private String stopUsername;

//  @ManyToOne
//  @JoinColumn(name = "TRAVELER_ID", referencedColumnName = "USER_ID")
//  private Traveler traveler;

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    Stop stop = (Stop) o;
    return Objects.equals(id, stop.id)
            && Objects.equals(stopLocation, stop.stopLocation)
            && Objects.equals(stopRating, stop.stopRating);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, stopLocation, stopRating);
  }
}
