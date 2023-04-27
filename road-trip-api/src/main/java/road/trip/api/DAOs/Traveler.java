package road.trip.api.DAOs;

import lombok.*;
import org.hibernate.Hibernate;

import javax.persistence.*;
import java.util.*;

@Getter
@Setter
@RequiredArgsConstructor
@Entity
@Table(name = Traveler.TABLE_NAME)
public class Traveler {
    public static final String TABLE_NAME = "TRAVELER";

    public Traveler(String username, String email, String password, Character isAdmin) {
        this.username = username;
        this.emailAddress = email;
        this.password = password;
        this.isAdmin = isAdmin;
    }

    @Id
    @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
    @SequenceGenerator(
            name = TABLE_NAME + "_GENERATOR",
            sequenceName = TABLE_NAME + "_SEQUENCE"
    )
    @Column(name = "USER_ID")
    private Long id;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "EMAIL_ADDRESS")
    private String emailAddress;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "BIO")
    private String bio;

    @Column(name = "FIRST_NAME")
    private String firstName;

    @Column(name = "LAST_NAME")
    private String lastName;

    @Column(name = "IS_ADMIN")
    private Character isAdmin;

    @Column(name = "followers")
    @ElementCollection
    private Set<String> followers = new HashSet<>();

    @Column(name = "following")
    @ElementCollection
    private Set<String> following = new HashSet<>();

    @OneToMany(mappedBy = "traveler", orphanRemoval = true)
    private Set<Trip> trips = new LinkedHashSet<>();

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "PROFILE_PIC")
    private byte[] profilePicture;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Traveler traveler = (Traveler) o;
        return id != null && Objects.equals(id, traveler.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
