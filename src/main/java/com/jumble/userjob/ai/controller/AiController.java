package com.jumble.userjob.ai.controller;

import com.jumble.userjob.ai.dto.CoverLetterRequestDto;
import com.jumble.userjob.ai.dto.CoverLetterResponseDto;
import com.jumble.userjob.ai.service.CoverLetterClientService;
import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.repository.CandidateRepository;
import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    private CoverLetterClientService coverLetterClientService;

    @PostMapping("/cover-letter/{jobId}")
    public ResponseEntity<?> generateCoverLetter(
            @PathVariable String jobId,
            Authentication authentication
    ) {
        String email = authentication.getName();

        Optional<Candidate> candidateOpt = candidateRepository.findByEmail(email);
        if (candidateOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Candidate not found.");
        }

        Optional<Job> jobOpt = jobService.getJobById(jobId);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Job not found.");
        }

        Candidate candidate = candidateOpt.get();
        Job job = jobOpt.get();

        if (candidate.getResumeData() == null || candidate.getResumeData().length == 0) {
            return ResponseEntity.status(404).body("Resume not found.");
        }

        String resumeBase64 = Base64.getEncoder().encodeToString(candidate.getResumeData());

        CoverLetterRequestDto requestDto = new CoverLetterRequestDto(
                candidate.getName(),
                job.getDescription(),
                candidate.getResumeFilename(),
                resumeBase64
        );

        CoverLetterResponseDto responseDto = coverLetterClientService.generateCoverLetter(requestDto);

        return ResponseEntity.ok(responseDto);
    }
}