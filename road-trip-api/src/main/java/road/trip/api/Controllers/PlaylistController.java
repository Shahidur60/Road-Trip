package road.trip.api.Controllers;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import road.trip.api.DAOs.Playlist;
import road.trip.api.DAOs.Trip;
import road.trip.api.Repositories.TripRepository;
import road.trip.api.Services.PlaylistService;

import java.util.List;


@Log4j2
@RestController
@CrossOrigin(origins={"http://localhost:3000",
        "http://triphala.tk:3000",
        "http://triphala.tk:80",
        "http://triphala.tk",
        "https://triphala.tk"}, maxAge = 3600)
@RequestMapping(value = "playlist")
public class PlaylistController {

    @Autowired
    TripRepository tripRepository;

    @Autowired
    PlaylistService playlistService;

    @PostMapping("/save/{token}")
    public @ResponseBody Playlist savePlaylistToTrip(@PathVariable String token, @RequestBody Playlist playlist) {
        return playlistService.save(token, playlist);
    }

    @GetMapping("/user/{username}")
    public @ResponseBody List<Playlist> getPlaylistsByUsername(@PathVariable String username) {
        return playlistService.getPlaylistsByUsername(username);
    }

    @DeleteMapping("/delete/{token}/id/{pid}")
    public @ResponseBody String deletePlaylist(@PathVariable String token, @PathVariable Long pid) {
        return playlistService.deletePlaylist(token, pid);
    }
}
