package road.trip.api.DAOs;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import javax.persistence.*;
import java.util.Objects;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@Entity
@Table(name = Playlist.TABLE_NAME)
public class Playlist {
    public static final String TABLE_NAME = "PLAYLIST";

    @Id
    @GeneratedValue(generator = TABLE_NAME + "_GENERATOR")
    @SequenceGenerator(
            name = TABLE_NAME + "_GENERATOR",
            sequenceName = TABLE_NAME + "_SEQUENCE"
    )
    @Column(name = "PLAYLIST_ID")
    private Long id;

    @Column(name = "PLAYLIST_NAME")
    private String playlistName;

    @Column(name = "TRIP_ID")
    private Long tripId;

    @Column(name = "TRIP_NAME")
    private String tripName;

    @Column(name = "SPOTIFY_ID")
    private String spotifyId;

    @Column(name = "PLAYLIST_USERNAME")
    private String playlistUsername;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Playlist playlist = (Playlist) o;
        return Objects.equals(id, playlist.id) && Objects.equals(playlistName, playlist.playlistName) && Objects.equals(tripId, playlist.tripId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, playlistName, tripId);
    }
}
