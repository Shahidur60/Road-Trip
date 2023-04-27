package road.trip.api.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;
import org.webjars.NotFoundException;
import road.trip.api.Configs.JwtUtil;
import road.trip.api.DAOs.Notification;
import road.trip.api.DAOs.Traveler;
import road.trip.api.Models.TravelerDetails;
import road.trip.api.Repositories.NotificationRepository;
import road.trip.api.Repositories.TravelerRepository;

import javax.persistence.EntityExistsException;
import java.io.IOException;
import java.util.Date;
import java.util.InvalidPropertiesFormatException;
import java.util.List;
import java.util.Optional;

@Service
public class TravelerService implements UserDetailsService {
    @Autowired
    private TravelerRepository travelerRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    public List<Traveler> listAll(){
        return travelerRepository.findAll();
    }

    public Optional<Traveler> findTraveler(Long userId) {
        return travelerRepository.findById(userId);
    }

    public Optional<Traveler> findTravelerByEmail(String email) {
        return travelerRepository.findTravelerByEmailAddress(email);
    }

    public Optional<Traveler> findTravelerByUsername(String username) {
        return travelerRepository.findTravelerByUsername(username);
    }

    public Optional<Traveler> findTravelerByToken(String token) {
        return travelerRepository.findTravelerByUsername(jwtUtil.extractUsername(token));
    }

    public @ResponseBody String followTraveler(String followName, String token) {
        Traveler currTraveler = findTravelerByToken(token).orElse(null);

        if (currTraveler == null) {
            throw new NotFoundException("Current traveler not found!");
        }

        Traveler toFollow = travelerRepository.findTravelerByUsername(followName).orElse(null);
        if (toFollow == null) {
            throw new NotFoundException("Traveler to follow not found!");
        }

        if (currTraveler.equals(toFollow)) {
            throw new NotFoundException("Cannot follow self!");
        }

        currTraveler.getFollowing().add(toFollow.getUsername());
        toFollow.getFollowers().add(currTraveler.getUsername());

        // Notify followed user
        Notification notification = new Notification();
        notification.setNotifMsg(currTraveler.getUsername() + " followed you!");
        notification.setNotifUsername(toFollow.getUsername());
        notification.setDate(new Date());
        notificationRepository.save(notification);

        travelerRepository.save(currTraveler);
        travelerRepository.save(toFollow);

        return "Successfully followed!";
    }

    public @ResponseBody String unfollowTraveler(String followName, String token) {
        Traveler current = findTravelerByToken(token).orElse(null);

        if (current == null) {
            throw new NotFoundException("Invalid token provided.");
        }

        if (!current.getFollowers().remove(followName)) {
            throw new NotFoundException("Traveler to unfollow not found.");
        }

        travelerRepository.save(current);
        return "Successfully unfollowed!";
    }

    public boolean validSignupString(String value) {
        return !value.contains(" ") && !value.equals("");
    }

    public @ResponseBody String saveTraveler(Traveler traveler) {
        // Does username or email already exist or is blank? Throw error
        if (findTravelerByEmail(traveler.getEmailAddress()).isPresent()) {
            throw new EntityExistsException("Error: user with email already exists.");
        } else if (findTravelerByUsername(traveler.getUsername()).isPresent()) {
            throw new EntityExistsException("Error: user with username already exists.");
        } else if (!validSignupString(traveler.getUsername()) || !validSignupString(traveler.getPassword())) {
            throw new IllegalArgumentException("Error: invalid username or password.");
        } else if (!validSignupString(traveler.getEmailAddress()) || !traveler.getEmailAddress().contains("@")) {
            throw new IllegalArgumentException("Error: invalid email provided");
        }

        String encodedPassword = passwordEncoder.encode(traveler.getPassword());
        traveler.setPassword(encodedPassword);

        // Under no circumstances can you sign up directly as admin
        traveler.setIsAdmin('N');
        return jwtUtil.generateToken(new TravelerDetails(travelerRepository.save(traveler)));
    }

    public @ResponseBody String loginTraveler(Traveler traveler) {
        Traveler foundTraveler = travelerRepository.findTravelerByEmailAddress(traveler.getEmailAddress()).orElse(null);

        if (foundTraveler == null) {
            throw new NotFoundException("Traveler not found!");
        } else if (!passwordEncoder.matches(traveler.getPassword(), foundTraveler.getPassword())
            && !foundTraveler.getPassword().equals(traveler.getPassword())) {

            throw new NotFoundException("Password does not match!");
        }

        return jwtUtil.generateToken(new TravelerDetails(foundTraveler));
    }

    public String deleteTraveler(Long id) {
        travelerRepository.deleteById(id);
        return "Successfully Deleted";
    }

    public String updateTraveler(Traveler newTraveler) {
        Traveler validTraveler = travelerRepository.findTravelerByUsername(newTraveler.getUsername()).orElse(null);

        if (validTraveler == null) {
            throw new NotFoundException("Traveler Not Found!");
        }

        String rawPassword = newTraveler.getPassword();
        String encodedPassword = validTraveler.getPassword();

        if (!passwordEncoder.matches(rawPassword, encodedPassword)
                && !rawPassword.equals(encodedPassword)) {
            throw new NotFoundException("Invalid password!");
        }

        // Update values on reference proxy
        validTraveler.setEmailAddress(newTraveler.getEmailAddress());
        validTraveler.setFirstName(newTraveler.getFirstName());
        validTraveler.setLastName(newTraveler.getLastName());
        validTraveler.setBio(newTraveler.getBio());

        travelerRepository.save(validTraveler);

        return "Successfully updated Traveler";
    }

    public Traveler uploadPfp(String token, MultipartFile file) throws IOException {
        Traveler traveler = findTravelerByToken(token).orElse(null);

        if (traveler == null) {
            throw new NotFoundException("Traveler not found!");
        }

        byte[] bytes = file.getBytes();

        traveler.setProfilePicture(bytes);
        return travelerRepository.save(traveler);
    }

    public Optional<Traveler> findTravelerFollowing(Long currId, String followName) {
        Optional<Traveler> t = travelerRepository.findTravelerByUsername(followName);

        if (t.isEmpty()) {
            throw new NotFoundException(followName + " Not Found!");
        }

        return travelerRepository.findTravelerByIdAndFollowing(currId, t.get().getUsername());
    }

    // Spring security method, do not call!
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        TravelerDetails details = new TravelerDetails(
                travelerRepository.findTravelerByUsernameAndIsAdmin(username, 'Y').orElse(null)
        );

        return details;
    }
}
