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
            @RequestParam("resume") MultipartFile resumeFile) {

        try {
            Candidate user = new Candidate();
            user.setName(name);
            user.setEmail(email);
            user.setSkills(skills);

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
    public ResponseEntity<byte[]> downloadResume(@PathVariable String id) {
        return userService.getUserById(id)
                .filter(candidate -> candidate.getResumeData() != null)
                .map(candidate -> ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + candidate.getResumeFilename() + "\"")
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, candidate.getResumeContentType())
                        .body(candidate.getResumeData()))
                .orElse(ResponseEntity.notFound().build());
    }
}
