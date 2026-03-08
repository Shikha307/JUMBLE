package com.jumble.userjob.job.service;

import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
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

    public List<Job> getJobsBySkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return getAllJobs();
        }
        // findBySkillsNeededIn returns one result per matching skill element,
        // so we deduplicate to ensure each job appears at most once.
        return jobRepository.findBySkillsNeededIn(skills)
                .stream()
                .distinct()
                .collect(Collectors.toList());
    }
}
