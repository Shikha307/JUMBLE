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
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;

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
        Optional<Candidate> candidateOpt = candidateRepository.findByEmailWithoutResume(email);

        if (candidateOpt.isPresent()) {
            Candidate candidate = candidateOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("name", candidate.getName());
            response.put("email", candidate.getEmail());
            response.put("skills", candidate.getSkills());
            response.put("country", candidate.getCountry());
            response.put("university", candidate.getUniversity());
            response.put("linkedin", candidate.getLinkedin());
            response.put("resumeFilename", candidate.getResumeFilename());
            response.put("resumes", candidate.getResumes());
            response.put("activeResumeId", candidate.getActiveResumeId());
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
    }

    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestParam("skills") List<String> skills,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "University", required = false) String university,
            @RequestParam(value = "linkedin", required = false) String linkedin,
            @RequestParam(value = "resume", required = false) MultipartFile resume) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
        }

        try {
            Candidate candidate = candidateOpt.get();
            candidate.setSkills(skills);
            candidate.setCountry(country);
            candidate.setUniversity(university);
            candidate.setLinkedin(linkedin);
            
            // ManageProfile.jsx sends a 5-byte "dummy" blob if the resume wasn't changed.
            if (resume != null && !resume.isEmpty() && resume.getSize() > 10) {
                candidate.setResumeFilename(resume.getOriginalFilename());
                candidate.setResumeContentType(resume.getContentType());
                candidate.setResumeData(resume.getBytes());
            }

            candidateRepository.save(candidate);
            return ResponseEntity.ok("Profile updated successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process resume file.");
        }
    }

    @PostMapping("/me/resumes")
    public ResponseEntity<?> addResume(
            Authentication authentication,
            @RequestParam("fieldName") String fieldName,
            @RequestParam("resume") MultipartFile resume) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
        }

        try {
            Candidate candidate = candidateOpt.get();
            if (candidate.getResumes() == null) {
                candidate.setResumes(new java.util.ArrayList<>());
            }
            
            com.jumble.userjob.candidate.model.CandidateResume newResume = new com.jumble.userjob.candidate.model.CandidateResume();
            newResume.setFieldName(fieldName);
            newResume.setFilename(resume.getOriginalFilename());
            newResume.setContentType(resume.getContentType());
            newResume.setData(resume.getBytes());
            
            candidate.getResumes().add(newResume);
            candidateRepository.save(candidate);
            
            return ResponseEntity.ok("Resume added successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process resume file.");
        }
    }

    @DeleteMapping("/me/resumes/{resumeId}")
    public ResponseEntity<?> deleteResume(
            Authentication authentication,
            @PathVariable String resumeId) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
        }

        Candidate candidate = candidateOpt.get();
        if (candidate.getResumes() != null) {
            candidate.getResumes().removeIf(r -> r.getId().equals(resumeId));
            if (resumeId.equals(candidate.getActiveResumeId())) {
                candidate.setActiveResumeId(null);
            }
            candidateRepository.save(candidate);
        }
        
        return ResponseEntity.ok("Resume deleted successfully.");
    }

    @PutMapping("/me/active-resume")
    public ResponseEntity<?> updateActiveResume(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String email = authentication.getName();
        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
        }

        Candidate candidate = candidateOpt.get();
        candidate.setActiveResumeId(request.get("activeResumeId"));
        candidateRepository.save(candidate);
        
        return ResponseEntity.ok("Active resume updated.");
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
    @GetMapping("/me/resume")
    public ResponseEntity<?> downloadMyResume(Authentication authentication) {
    String email = authentication.getName();
    Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);

    if (candidateOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Candidate not found.");
    }

    Candidate candidate = candidateOpt.get();

    if (candidate.getResumeData() == null || candidate.getResumeData().length == 0) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resume not found.");
    }

    String filename = candidate.getResumeFilename() != null
            ? candidate.getResumeFilename()
            : "resume";

    String contentType = candidate.getResumeContentType() != null
            ? candidate.getResumeContentType()
            : MediaType.APPLICATION_OCTET_STREAM_VALUE;

    ByteArrayResource resource = new ByteArrayResource(candidate.getResumeData());

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.parseMediaType(contentType))
            .contentLength(candidate.getResumeData().length)
            .body(resource);
    }
}