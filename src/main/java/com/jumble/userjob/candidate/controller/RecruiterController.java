package com.jumble.userjob.candidate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jumble.userjob.candidate.model.Recruiter;
import com.jumble.userjob.candidate.service.RecruiterService;

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
