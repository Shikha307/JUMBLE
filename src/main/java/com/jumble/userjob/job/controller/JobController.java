package com.jumble.userjob.job.controller;

import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    public ResponseEntity<Job> createJob(@RequestBody Job job) {
        if (job.getRecruiterId() == null || job.getRecruiterId().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Job savedJob = jobService.createJob(job);
        return new ResponseEntity<>(savedJob, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getJobs(@RequestParam(required = false) List<String> skills) {
        List<Job> jobs = jobService.getJobsBySkills(skills);
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Job>> getAllJobs() {
        List<Job> jobs = jobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable String id) {
        return jobService.getJobById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        jobService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
