package com.jumble.userjob.user.controller;

import com.jumble.userjob.user.model.Recruiter;
import com.jumble.userjob.user.service.RecruiterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiters")
public class RecruiterController {

    @Autowired
    private RecruiterService recruiterService;

    @PostMapping
    public ResponseEntity<Recruiter> createRecruiter(@RequestBody Recruiter recruiter) {
        Recruiter savedRecruiter = recruiterService.createRecruiter(recruiter);
        return new ResponseEntity<>(savedRecruiter, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recruiter> getRecruiterById(@PathVariable String id) {
        return recruiterService.getRecruiterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
