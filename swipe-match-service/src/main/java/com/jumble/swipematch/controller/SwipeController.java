package com.jumble.swipematch.controller;

import com.jumble.swipematch.dto.SwipeRequestDTO;
import com.jumble.swipematch.service.SwipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/swipes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SwipeController {

    private final SwipeService swipeService;

    @PostMapping
    public ResponseEntity<String> recordSwipe(@RequestBody SwipeRequestDTO request) {
        swipeService.processSwipe(request);
        return ResponseEntity.ok("Swipe recorded successfully");
    }

    /**
     * GET /api/v1/swipes/jobs/{jobId}/unswiped-candidates
     * Returns a list of *unswiped* Candidates that the recruiter hasn't seen yet
     * for this job.
     */
    @GetMapping("/jobs/{jobId}/unswiped-candidates")
    public ResponseEntity<java.util.List<com.jumble.swipematch.model.Candidate>> getUnswipedCandidates(
            @PathVariable String jobId) {
        return ResponseEntity.ok(swipeService.getUnswipedCandidatesForJob(jobId));
    }

    /**
     * GET /api/v1/swipes/candidates/{candidateId}/unswiped-jobs
     * Returns a list of *unswiped* Jobs that the candidate hasn't seen yet.
     * Excludes any job the candidate has already swiped left or right on.
     */
    @GetMapping("/candidates/{candidateId}/unswiped-jobs")
    public ResponseEntity<java.util.List<com.jumble.swipematch.model.Job>> getUnswipedJobs(
            @PathVariable String candidateId) {
        return ResponseEntity.ok(swipeService.getUnswipedJobsForCandidate(candidateId));
    }
}
