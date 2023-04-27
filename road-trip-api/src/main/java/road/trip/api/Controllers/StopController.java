package road.trip.api.Controllers;

import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.webjars.NotFoundException;
import road.trip.api.Configs.JwtUtil;
import road.trip.api.DAOs.Stop;
import road.trip.api.Services.StopService;

import java.util.List;
import java.util.Optional;

@Log4j2
@RestController
@CrossOrigin(origins={"http://localhost:3000",
        "http://triphala.tk:3000",
        "http://triphala.tk:80",
        "http://triphala.tk",
        "https://triphala.tk"}, maxAge = 3600)
@RequestMapping(value = "stop")
public class StopController {
  @Autowired
  StopService stopService;

  @Autowired
  JwtUtil jwtUtil;

  @GetMapping("/id/{id}")
  public Stop getStopById(@PathVariable Long id) {
    Optional<Stop> stop = stopService.findStop(id);
    return stop.orElse(null);
  }

  @GetMapping("/location/{loc}")
  public @ResponseBody Stop getStopByLocation(@PathVariable String loc) {
    return stopService.findStopByLocation(loc).orElse(null);
  }
  @GetMapping("/stops")
  public List<Stop> showStopList(Model model){
    List<Stop> listStops = stopService.listAll();
    model.addAttribute("listStops", listStops);
    return listStops;
  }

  @PostMapping("/save/{token}")
  public @ResponseBody Stop saveStop(@PathVariable String token, @RequestBody Stop stop) {
    String username = jwtUtil.extractUsername(token);

    if (!stop.getStopUsername().equals(username)) {
      throw new NotFoundException("Invalid token provided.");
    }

    return stopService.saveStop(stop);
  }

  @DeleteMapping("/delete/{token}/{id}")
  public @ResponseBody String deleteStopWithId(@PathVariable String token, @PathVariable Long id) {
    String username = jwtUtil.extractUsername(token);
    Stop stop = stopService.findStop(id).orElse(null);

    if (stop == null) {
      throw new NotFoundException("Stop not found.");
    }

    if (!stop.getStopUsername().equals(username)) {
      throw new NotFoundException("Invalid token provided.");
    }

    return stopService.deleteStop(id);
  }
}
