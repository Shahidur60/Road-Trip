package road.trip.api.Controllers;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.webjars.NotFoundException;
import road.trip.api.DAOs.Traveler;
import road.trip.api.Services.TravelerService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Log4j2
@RestController
@CrossOrigin(origins={"http://localhost:3000",
        "http://triphala.tk:3000",
        "http://triphala.tk:80",
        "http://triphala.tk",
        "https://triphala.tk"}, maxAge = 3600)
@RequestMapping(value = "traveler")
public class TravelerController {
    @Autowired
    TravelerService travelerService;

    @GetMapping("/travelers")
    public List<Traveler> showTravelerList(Model model){
        List<Traveler> listTravelers = travelerService.listAll();
        model.addAttribute("listTravelers", listTravelers);
        return listTravelers;
    }

    @GetMapping("/token/{token}")
    public Traveler getTravelerByToken(@PathVariable String token) {
        return travelerService.findTravelerByToken(token).orElse(null);
    }

    @GetMapping("/id/{id}")
    public Traveler findTravelerById(@PathVariable Long id) {
        return travelerService.findTraveler(id).orElse(null);
    }

    @GetMapping("/email/{email}")
    public @ResponseBody Traveler findTravelerByEmail(@PathVariable String email) {
        return travelerService.findTravelerByEmail(email).orElse(null);
    }

    @GetMapping("/username/{username}")
    public @ResponseBody Traveler findTravelerByUsername(@PathVariable String username) {
        return travelerService.findTravelerByUsername(username).orElse(null);
    }

    @GetMapping("/following/{id}/{username}")
    public @ResponseBody Traveler findTravelerFollowing(@PathVariable Long id, @PathVariable String username) {
        return travelerService.findTravelerFollowing(id, username).orElse(null);
    }

    @PutMapping("/follow/{token}/{username}")
    public @ResponseBody String followTraveler(@PathVariable String token, @PathVariable String username) {
        return travelerService.followTraveler(username, token);
    }

    @PutMapping("/unfollow/{token}/{username}")
    public @ResponseBody String unfollowTraveler(@PathVariable String token, @PathVariable String username) {
        return travelerService.unfollowTraveler(username, token);
    }

    @PostMapping("/sign-up")
    public @ResponseBody String signUp(@RequestBody Traveler user) {
        return travelerService.saveTraveler(user);
    }

    @PostMapping("/login")
    public @ResponseBody String login(@RequestBody Traveler user) throws Exception {
        return travelerService.loginTraveler(user);
    }

    @PutMapping("/update")
    public @ResponseBody String updateTrav(@RequestBody Traveler traveler) {
        return travelerService.updateTraveler(traveler);
    }

    @PutMapping("/upload")
    public @ResponseBody Traveler uploadPfp(@RequestParam("token") String token, @RequestParam("file") MultipartFile file) throws IOException {
        return travelerService.uploadPfp(token, file);
    }

    @DeleteMapping("/delete/{token}/{id}")
    public @ResponseBody String deleteTravelerWithId(@PathVariable String token, @PathVariable Long id) {
        Traveler traveler = travelerService.findTravelerByToken(token).orElse(null);

        if (traveler == null || traveler.getIsAdmin() != 'Y') {
            throw new NotFoundException("Method not allowed!");
        }

        return travelerService.deleteTraveler(id);
    }
}
