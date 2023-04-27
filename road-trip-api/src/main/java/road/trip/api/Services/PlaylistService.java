package road.trip.api.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.webjars.NotFoundException;
import road.trip.api.DAOs.Playlist;
import road.trip.api.DAOs.Traveler;
import road.trip.api.DAOs.Trip;
import road.trip.api.Repositories.PlaylistRepository;
import road.trip.api.Repositories.TripRepository;

import java.util.List;

@Service
public class PlaylistService {
    @Autowired
    PlaylistRepository playlistRepository;

    @Autowired
    TripRepository tripRepository;

    @Autowired
    TravelerService travelerService;

    public Playlist save(String token, Playlist playlist) {
        Traveler traveler = travelerService.findTravelerByToken(token).orElse(null);

        if (traveler == null) {
            throw new NotFoundException("No valid token provided.");
        }

        Trip trip = tripRepository.findById(playlist.getTripId()).orElse(null);
        if (trip == null) {
            throw new NotFoundException("Trip with given ID does not exist!");
        }

        playlist = playlistRepository.save(playlist);

        trip.getPlaylists().add(playlist);
        tripRepository.save(trip);

        return playlist;
    }

    public List<Playlist> getPlaylistsByUsername(String username) {
        return playlistRepository.findPlaylistsByPlaylistUsername(username);
    }

    public String deletePlaylist(String token, Long pid) {
        Traveler traveler = travelerService.findTravelerByToken(token).orElse(null);

        if (traveler == null) {
            throw new NotFoundException("No valid token provided.");
        }

        Playlist playlist = playlistRepository.findById(pid).orElse(null);
        if (playlist == null) {
            throw new NotFoundException("Playlist not found.");
        }

        if (!playlist.getPlaylistUsername().equals(traveler.getUsername())) {
            throw new NotFoundException("This is not your playlist!");
        }

        playlistRepository.delete(playlist);
        return "Playlist Successfully Deleted";
    }
}
