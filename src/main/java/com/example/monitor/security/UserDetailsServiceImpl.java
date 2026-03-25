package com.example.monitor.security;

import com.example.monitor.model.User;
import com.example.monitor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByUsername(username)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + username)));

        return CustomUserDetails.build(user);
    }
}
