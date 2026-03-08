package com.jumble.userjob.candidate.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jumble.userjob.job.model.Job;

import com.jumble.userjob.candidate.model.Recruiter;
import com.jumble.userjob.candidate.service.RecruiterService;

import java.util.List;

@RestController
@RequestMapping("/api/recruiters")
public class RecruiterController {

    @Autowired
    private RecruiterService recruiterService;

    @PostMapping
    public ResponseEntity<Recruiter> createRecruiter(@RequestBody Recruiter recruiter) {
        Recruiter saved = recruiterService.createRecruiter(recruiter);
        return ResponseEntity.status(201).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recruiter> getRecruiterById(@PathVariable String id) {
        return recruiterService.getRecruiterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<Job>> getJobsByRecruiterId(@PathVariable String id) {
        List<Job> jobs = recruiterService.getJobsByRecruiterId(id);
        return ResponseEntity.ok(jobs);
    }
}
