package com.jumble.userjob.config;

import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.model.Recruiter;
import com.jumble.userjob.candidate.repository.CandidateRepository;
import com.jumble.userjob.candidate.repository.RecruiterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // First check candidates
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);
        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            return new User(candidate.getEmail(), candidate.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_CANDIDATE")));
        }

        // Then check recruiters
        Optional<Recruiter> recruiterOpt = recruiterRepository.findByEmail(email);
        if (recruiterOpt.isPresent()) {
            Recruiter recruiter = recruiterOpt.get();
            return new User(recruiter.getEmail(), recruiter.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_RECRUITER")));
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
