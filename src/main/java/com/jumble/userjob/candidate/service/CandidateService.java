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

    public Candidate updateCandidate(String id, Candidate updates) {
        Candidate existing = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + id));

        if (updates.getName() != null)              existing.setName(updates.getName());
        if (updates.getEmail() != null)             existing.setEmail(updates.getEmail());
        if (updates.getSkills() != null)            existing.setSkills(updates.getSkills());
        if (updates.getCountry() != null)           existing.setCountry(updates.getCountry());
        if (updates.getUniversity() != null)        existing.setUniversity(updates.getUniversity());
        if (updates.getPassword() != null)          existing.setPassword(updates.getPassword());
        if (updates.getResumeFilename() != null)    existing.setResumeFilename(updates.getResumeFilename());
        if (updates.getResumeContentType() != null) existing.setResumeContentType(updates.getResumeContentType());
        if (updates.getResumeData() != null)        existing.setResumeData(updates.getResumeData());

        return candidateRepository.save(existing);
    }
}
