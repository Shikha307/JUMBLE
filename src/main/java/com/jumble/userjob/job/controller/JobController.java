package com.jumble.userjob.job.controller;

import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.model.SwipeRecord;
import com.jumble.userjob.job.model.SwipeRecord.SwipeDirection;
import com.jumble.userjob.job.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    @Autowired
    private JobService jobService;

    // ── Job CRUD ─────────────────────────────────────────────────────────────

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

    // ── Swipe endpoints ───────────────────────────────────────────────────────

    /**
     * Candidate swipes right or left on a job.
     *
     * POST /api/jobs/{jobId}/candidate-swipe
     * Body: { "candidateId": "...", "direction": "RIGHT" }
     */
    @PostMapping("/{jobId}/candidate-swipe")
    public ResponseEntity<?> candidateSwipe(
            @PathVariable String jobId,
            @RequestBody Map<String, String> body) {

        String candidateId = body.get("candidateId");
        String directionStr = body.get("direction");

        if (candidateId == null || directionStr == null) {
            return ResponseEntity.badRequest().body("candidateId and direction are required.");
        }

        SwipeDirection direction;
        try {
            direction = SwipeDirection.valueOf(directionStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("direction must be RIGHT or LEFT.");
        }

        SwipeRecord result = jobService.recordCandidateSwipe(candidateId, jobId, direction);
        return ResponseEntity.ok(result);
    }

    /**
     * Recruiter swipes right or left on a candidate for a specific job.
     *
     * POST /api/jobs/{jobId}/recruiter-swipe
     * Body: { "candidateId": "...", "direction": "RIGHT" }
     */
    @PostMapping("/{jobId}/recruiter-swipe")
    public ResponseEntity<?> recruiterSwipe(
            @PathVariable String jobId,
            @RequestBody Map<String, String> body) {

        String candidateId = body.get("candidateId");
        String directionStr = body.get("direction");

        if (candidateId == null || directionStr == null) {
            return ResponseEntity.badRequest().body("candidateId and direction are required.");
        }

        SwipeDirection direction;
        try {
            direction = SwipeDirection.valueOf(directionStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("direction must be RIGHT or LEFT.");
        }

        SwipeRecord result = jobService.recordRecruiterSwipe(candidateId, jobId, direction);
        return ResponseEntity.ok(result);
    }

    /**
     * Get all swipe records for a job (all candidates who swiped on it).
     *
     * GET /api/jobs/{jobId}/swipes
     */
    @GetMapping("/{jobId}/swipes")
    public ResponseEntity<List<SwipeRecord>> getSwipesForJob(@PathVariable String jobId) {
        return ResponseEntity.ok(jobService.getSwipesForJob(jobId));
    }

    /**
     * Get all swipe records for a candidate (all jobs they swiped on).
     *
     * GET /api/jobs/candidate/{candidateId}/swipes
     */
    @GetMapping("/candidate/{candidateId}/swipes")
    public ResponseEntity<List<SwipeRecord>> getSwipesForCandidate(@PathVariable String candidateId) {
        return ResponseEntity.ok(jobService.getSwipesForCandidate(candidateId));
    }

    /**
     * Get all matches (both swiped RIGHT) for a candidate.
     *
     * GET /api/jobs/candidate/{candidateId}/matches
     */
    @GetMapping("/candidate/{candidateId}/matches")
    public ResponseEntity<List<SwipeRecord>> getMatchesForCandidate(@PathVariable String candidateId) {
        return ResponseEntity.ok(jobService.getMatchesForCandidate(candidateId));
    }

    /**
     * Get all matches for a job (candidates the recruiter also swiped right on).
     *
     * GET /api/jobs/{jobId}/matches
     */
    @GetMapping("/{jobId}/matches")
    public ResponseEntity<List<SwipeRecord>> getMatchesForJob(@PathVariable String jobId) {
        return ResponseEntity.ok(jobService.getMatchesForJob(jobId));
    }
}
