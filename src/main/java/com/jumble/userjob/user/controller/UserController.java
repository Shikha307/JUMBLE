package com.jumble.userjob.user.controller;

import com.jumble.userjob.user.model.User;
import com.jumble.userjob.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // We consume multipart/form-data for the file upload alongside the remaining
    // user payload.
    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> createUser(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("skills") List<String> skills,
            @RequestParam("resume") MultipartFile resumeFile) {

        try {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setSkills(skills);

            User savedUser = userService.createUser(user, resumeFile);
            return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Could not save the resume file: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<byte[]> downloadResume(@PathVariable String id) {
        return userService.getUserById(id)
                .filter(user -> user.getResumeData() != null)
                .map(user -> ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + user.getResumeFilename() + "\"")
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, user.getResumeContentType())
                        .body(user.getResumeData()))
                .orElse(ResponseEntity.notFound().build());
    }
}
