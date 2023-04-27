package road.trip.api.DAOs;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.Hibernate;

import javax.persistence.*;
import java.util.*;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Entity
@Table(name = Trip.TABLE_NAME)
public class Trip {
    public static final String TABLE_NAME = "TRIP";

    @Id
    @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
    @SequenceGenerator(
            name = TABLE_NAME + "_GENERATOR",
            sequenceName = TABLE_NAME + "_SEQUENCE"
    )
    @Column(name = "TRIP_ID")
    private Long id;

    //Foreign Key
    @Column(name = "START_LOCATION")
    private String startLocation;

    //Foreign Key
    @Column(name = "END_LOCATION")
    private String endLocation;

    @Column(name = "DURATION")
    private String duration;

    @Column(name = "DISTANCE")
    private String distance;

    @Column(name = "DATE")
    private Date date;

    @Column(name = "TRIP_USERNAME")
    private String tripUsername;

    @Column(name = "TRIP_RATING")
    private Integer tripRating;

    @ManyToOne
    @JoinColumn(name = "USER_ID", referencedColumnName = "USER_ID")
    @JsonBackReference
    private Traveler traveler;

    @OneToMany(orphanRemoval = true)
    private List<Playlist> playlists = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "trip_stops",
            joinColumns = @JoinColumn(name = "trip_trip_id"),
            inverseJoinColumns = @JoinColumn(name = "stops_stop_id"))
    private Set<Stop> stops = new LinkedHashSet<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Trip trip = (Trip) o;
        return id != null && Objects.equals(id, trip.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
