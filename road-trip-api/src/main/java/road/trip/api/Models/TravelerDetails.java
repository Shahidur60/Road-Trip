package road.trip.api.Models;

import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import road.trip.api.DAOs.Traveler;

import java.util.Collection;

@AllArgsConstructor
public class TravelerDetails implements UserDetails {
  private Traveler traveler;

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return null;
  }

  @Override
  public String getPassword() {
    return traveler.getPassword();
  }

  @Override
  public String getUsername() {
    return traveler.getUsername();
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
