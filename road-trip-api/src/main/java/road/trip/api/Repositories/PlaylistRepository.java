package road.trip.api.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import road.trip.api.DAOs.Playlist;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    Optional<Playlist> findPlaylistByTripId(Long tripID);
    Optional<Playlist> findPlaylistByPlaylistName(String playlistName);
    List<Playlist> findPlaylistsByPlaylistUsername(String playlistUsername);
}
