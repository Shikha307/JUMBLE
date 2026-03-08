package com.jumble.userjob.candidate.controller;

import com.jumble.userjob.auth.dto.PasswordUpdateRequest;
import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.repository.CandidateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/candidates")
public class CandidateProfileController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("name", candidate.getName());
            response.put("email", candidate.getEmail());
            response.put("skills", candidate.getSkills());
            response.put("resumeFilename", candidate.getResumeFilename());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
    }

    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestParam("skills") List<String> skills,
            @RequestParam("resume") MultipartFile resume) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
        }

        try {
            Candidate candidate = candidateOpt.get();
            candidate.setSkills(skills);
            candidate.setResumeFilename(resume.getOriginalFilename());
            candidate.setResumeContentType(resume.getContentType());
            candidate.setResumeData(resume.getBytes());

            candidateRepository.save(candidate);
            return ResponseEntity.ok("Profile updated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process resume file.");
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(Authentication authentication, @RequestBody PasswordUpdateRequest request) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
        }

        Candidate candidate = candidateOpt.get();

        if (!passwordEncoder.matches(request.getOldPassword(), candidate.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Incorrect old password.");
        }

        candidate.setPassword(passwordEncoder.encode(request.getNewPassword()));
        candidateRepository.save(candidate);

        return ResponseEntity.ok("Password updated successfully.");
    }
}
