package com.jumble.userjob.candidate.controller;

import com.jumble.userjob.auth.dto.PasswordUpdateRequest;
import com.jumble.userjob.candidate.model.Recruiter;
import com.jumble.userjob.candidate.repository.RecruiterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/recruiters")
public class RecruiterProfileController {

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        Optional<Recruiter> recruiterOpt = recruiterRepository.findByEmail(email);

        if (recruiterOpt.isPresent()) {
            Recruiter recruiter = recruiterOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("name", recruiter.getName());
            response.put("email", recruiter.getEmail());
            response.put("company", recruiter.getCompany());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recruiter not found.");
    }

    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(Authentication authentication, @RequestBody Map<String, String> payload) {
        String email = authentication.getName();
        Optional<Recruiter> recruiterOpt = recruiterRepository.findByEmail(email);

        if (recruiterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recruiter not found.");
        }

        Recruiter recruiter = recruiterOpt.get();
        if (payload.containsKey("company")) {
            recruiter.setCompany(payload.get("company"));
        }

        recruiterRepository.save(recruiter);
        return ResponseEntity.ok("Profile updated successfully.");
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(Authentication authentication, @RequestBody PasswordUpdateRequest request) {
        String email = authentication.getName();
        Optional<Recruiter> recruiterOpt = recruiterRepository.findByEmail(email);

        if (recruiterOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recruiter not found.");
        }

        Recruiter recruiter = recruiterOpt.get();

        if (!passwordEncoder.matches(request.getOldPassword(), recruiter.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect old password.");
        }

        recruiter.setPassword(passwordEncoder.encode(request.getNewPassword()));
        recruiterRepository.save(recruiter);

        return ResponseEntity.ok("Password updated successfully.");
    }
}
