package com.jumble.userjob.candidate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.service.CandidateService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService userService;

    // We consume multipart/form-data for the file upload alongside the remaining
    // candidate payload.
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createUser(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("skills") List<String> skills,
            @RequestParam("resume") MultipartFile resumeFile,
            @RequestParam("country") String country,
            @RequestParam("University") String university,
            @RequestParam("password") String password,
            @RequestParam("linkedin") String linkedin) {

        try {
            Candidate user = new Candidate();
            user.setName(name);
            user.setEmail(email);
            user.setSkills(skills);
            user.setCountry(country);
            user.setUniversity(university);
            user.setPassword(password);
            user.setLinkedin(linkedin);

            Candidate savedUser = userService.createUser(user, resumeFile);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not save the resume file: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(
            @PathVariable String id, 
            @RequestParam(value = "resumeId", required = false) String resumeId) {
        return userService.getUserById(id)
                .map(candidate -> {
                    // 1. If a specific resumeId is requested, serve that one
                    if (resumeId != null && candidate.getResumes() != null) {
                        for (com.jumble.userjob.candidate.model.CandidateResume r : candidate.getResumes()) {
                            if (r.getId().equals(resumeId)) {
                                return ResponseEntity.ok()
                                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + r.getFilename() + "\"")
                                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, r.getContentType())
                                        .body(r.getData());
                            }
                        }
                    }
                    // 2. No specific resumeId — check if candidate has set an activeResumeId
                    String activeId = candidate.getActiveResumeId();
                    if (activeId != null && !activeId.isBlank() && candidate.getResumes() != null) {
                        for (com.jumble.userjob.candidate.model.CandidateResume r : candidate.getResumes()) {
                            if (r.getId().equals(activeId)) {
                                return ResponseEntity.ok()
                                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"" + r.getFilename() + "\"")
                                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, r.getContentType())
                                        .body(r.getData());
                            }
                        }
                    }
                    // 3. Fall back to original primary resume
                    if (candidate.getResumeData() != null) {
                        return ResponseEntity.ok()
                                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                        "attachment; filename=\"" + candidate.getResumeFilename() + "\"")
                                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, candidate.getResumeContentType())
                                .body(candidate.getResumeData());
                    }
                    // 4. Fall back to first uploaded resume
                    if (candidate.getResumes() != null && !candidate.getResumes().isEmpty()) {
                        com.jumble.userjob.candidate.model.CandidateResume r = candidate.getResumes().get(0);
                        return ResponseEntity.ok()
                                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                        "attachment; filename=\"" + r.getFilename() + "\"")
                                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, r.getContentType())
                                .body(r.getData());
                    }
                    return null;
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<Candidate>> getAllCandidates() {
        return ResponseEntity.ok(userService.getAllCandidates());
    }
}
