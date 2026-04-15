package com.jumble.userjob.ai.controller;

import com.jumble.userjob.ai.dto.CoverLetterRequestDto;
import com.jumble.userjob.ai.dto.CoverLetterResponseDto;
import com.jumble.userjob.ai.service.CoverLetterClientService;
import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.model.CandidateResume;
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
            @RequestParam(value = "resumeId", required = false) String resumeId,
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

        byte[] selectedResumeBytes = null;
        String selectedResumeFilename = candidate.getResumeFilename();

        if (resumeId != null && !resumeId.isBlank() && !"default".equalsIgnoreCase(resumeId)) {
            if (candidate.getResumes() != null) {
                for (CandidateResume resume : candidate.getResumes()) {
                    if (resumeId.equals(resume.getId())) {
                        selectedResumeBytes = resume.getData();
                        selectedResumeFilename = resume.getFilename();
                        break;
                    }
                }
            }
            if (selectedResumeBytes == null) {
                return ResponseEntity.status(404).body("Selected resume not found.");
            }
        } else {
            selectedResumeBytes = candidate.getResumeData();
        }

        if (selectedResumeBytes == null || selectedResumeBytes.length == 0) {
            return ResponseEntity.status(404).body("Resume not found.");
        }

        String resumeBase64 = Base64.getEncoder().encodeToString(selectedResumeBytes);

        CoverLetterRequestDto requestDto = new CoverLetterRequestDto(
                candidate.getName(),
                job.getDescription(),
                selectedResumeFilename,
                resumeBase64
        );

        CoverLetterResponseDto responseDto = coverLetterClientService.generateCoverLetter(requestDto);

        return ResponseEntity.ok(responseDto);
    }
}