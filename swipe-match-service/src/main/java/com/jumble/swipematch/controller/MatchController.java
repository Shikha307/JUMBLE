package com.jumble.swipematch.controller;

import com.jumble.swipematch.model.Match;
import com.jumble.swipematch.repository.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchRepository matchRepository;

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Match>> getCandidateMatches(@PathVariable String candidateId) {
        return ResponseEntity.ok(matchRepository.findByCandidateId(candidateId));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Match>> getJobMatches(@PathVariable String jobId) {
        return ResponseEntity.ok(matchRepository.findByJobId(jobId));
    }
}
