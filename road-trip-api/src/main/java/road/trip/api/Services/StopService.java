package road.trip.api.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import road.trip.api.DAOs.Stop;
import road.trip.api.Repositories.StopRepository;

import java.util.List;
import java.util.Optional;

@Service
public class StopService {
  @Autowired
  StopRepository stopRepository;

  public Optional<Stop> findStop(Long stopId) {
    return stopRepository.findById(stopId);
  }

  public @ResponseBody Optional<Stop> findStopByLocation(String location) {
    return stopRepository.findStopByStopLocation(location);
  }

  public List<Stop> listAll(){
    return stopRepository.findAll();
  }

  public @ResponseBody Stop saveStop(Stop stop) {
    Stop foundStop = null;

    if (stop.getId() != null) {
      foundStop = stopRepository.findById(stop.getId()).orElse(null);
    }

    if (foundStop != null) {
      foundStop.setStopRating(stop.getStopRating());
      stop = foundStop;
    }

    stopRepository.save(stop);
    return stop;
  }

  public String deleteStop(Long id){
      stopRepository.deleteById(id);
      return "Successfully Deleted";
  }
}
