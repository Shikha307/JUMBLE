package com.jumble.userjob.job.repository;

import com.jumble.userjob.job.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
    List<Job> findBySkillsNeededIn(List<String> skills);
}
