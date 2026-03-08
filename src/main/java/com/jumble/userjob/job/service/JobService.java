package com.jumble.userjob.job.service;

import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(String id) {
        return jobRepository.findById(id);
    }

    public List<Job> getJobsBySkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return getAllJobs();
        }
        return jobRepository.findBySkillsNeededIn(skills)
                .stream()
                .distinct()
                .collect(Collectors.toList());
    }

    public void deleteJob(String id) {
        jobRepository.deleteById(id);
    }

    public Job updateJob(String id, Job jobDetails) {
        return jobRepository.findById(id).map(existingJob -> {
            existingJob.setRoleName(jobDetails.getRoleName());
            existingJob.setDescription(jobDetails.getDescription());
            existingJob.setCountry(jobDetails.getCountry());
            existingJob.setSkillsNeeded(jobDetails.getSkillsNeeded());
            return jobRepository.save(existingJob);
        }).orElseThrow(() -> new RuntimeException("Job not found with id " + id));
    }
}
