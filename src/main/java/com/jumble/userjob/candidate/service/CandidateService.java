package com.jumble.userjob.candidate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.jumble.userjob.candidate.model.Candidate;
import com.jumble.userjob.candidate.repository.CandidateRepository;

import java.io.IOException;
import java.util.Optional;

@Service
public class CandidateService {

    @Autowired
    private CandidateRepository candidateRepository;

    public Candidate createUser(Candidate candidate, MultipartFile resumeFile) throws IOException {
        if (resumeFile != null && !resumeFile.isEmpty()) {
            candidate.setResumeFilename(resumeFile.getOriginalFilename());
            candidate.setResumeContentType(resumeFile.getContentType());
            candidate.setResumeData(resumeFile.getBytes());
        }

        return candidateRepository.save(candidate);
    }

    public Optional<Candidate> getUserById(String id) {
        return candidateRepository.findById(id);
    }

    public Candidate updateUser(String id, Candidate user) {
        return candidateRepository.save(user);
    }
}
