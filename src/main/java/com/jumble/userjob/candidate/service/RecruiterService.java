package com.jumble.userjob.candidate.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jumble.userjob.candidate.model.Recruiter;
import com.jumble.userjob.candidate.repository.RecruiterRepository;
import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.repository.JobRepository;

import java.util.List;
import java.util.Optional;

@Service
public class RecruiterService {

    @Autowired
    private RecruiterRepository recruiterRepository;

    @Autowired
    private JobRepository jobRepository;

    public Recruiter createRecruiter(Recruiter recruiter) {
        return recruiterRepository.save(recruiter);
    }

    public Optional<Recruiter> getRecruiterById(String id) {
        return recruiterRepository.findById(id);
    }

    public List<Job> getJobsByRecruiterId(String id) {
        return jobRepository.findByRecruiterId(id);
    }
}