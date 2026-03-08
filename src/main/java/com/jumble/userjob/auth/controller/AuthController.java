package com.jumble.userjob.auth.controller;

import com.jumble.userjob.auth.dto.AuthResponse;
import com.jumble.userjob.auth.dto.LoginRequest;
import com.jumble.userjob.auth.dto.RecruiterRegisterRequest;
import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.model.Recruiter;
import com.jumble.userjob.candidate.repository.CandidateRepository;
import com.jumble.userjob.candidate.repository.RecruiterRepository;
import com.jumble.userjob.config.CustomUserDetailsService;
import com.jumble.userjob.config.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

            // Determine role and name based on which repository yields the result
            String role;
            String name;
            String id;

            Optional<Candidate> candidateOpt = candidateRepository.findByEmail(request.getEmail());
            if (candidateOpt.isPresent()) {
                role = "candidate";
                name = candidateOpt.get().getName();
                id = candidateOpt.get().getId();
            } else {
                Recruiter recruiter = recruiterRepository.findByEmail(request.getEmail()).get();
                role = "recruiter";
                name = recruiter.getName();
                id = recruiter.getId();
            }

            String token = jwtService.generateToken(userDetails, role);

            return ResponseEntity.ok(new AuthResponse(token, id, role, name, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, null, null, null, "Invalid credentials"));
        }
    }

    @PostMapping("/register/candidate")
    public ResponseEntity<?> registerCandidate(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("skills") List<String> skills,
            @RequestParam("resume") MultipartFile resume) {
        if (candidateRepository.findByEmail(email).isPresent() || recruiterRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already in use.");
        }

        try {
            Candidate candidate = new Candidate();
            candidate.setName(name);
            candidate.setEmail(email);
            candidate.setPassword(passwordEncoder.encode(password));
            candidate.setSkills(skills);
            candidate.setResumeFilename(resume.getOriginalFilename());
            candidate.setResumeContentType(resume.getContentType());
            candidate.setResumeData(resume.getBytes());

            candidateRepository.save(candidate);

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails, "candidate");

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(token, candidate.getId(), "candidate", name, "Candidate registered successfully"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process resume file.");
        }
    }

    @PostMapping("/register/recruiter")
    public ResponseEntity<?> registerRecruiter(@RequestBody RecruiterRegisterRequest request) {
        if (candidateRepository.findByEmail(request.getEmail()).isPresent()
                || recruiterRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already in use.");
        }

        Recruiter recruiter = new Recruiter();
        recruiter.setName(request.getName());
        recruiter.setEmail(request.getEmail());
        recruiter.setCompany(request.getCompanyName());
        recruiter.setPassword(passwordEncoder.encode(request.getPassword()));

        recruiterRepository.save(recruiter);

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails, "recruiter");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, recruiter.getId(), "recruiter", recruiter.getName(), "Recruiter registered successfully"));
    }
}
