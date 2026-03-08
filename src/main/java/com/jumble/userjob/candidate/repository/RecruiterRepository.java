package com.jumble.userjob.candidate.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.jumble.userjob.candidate.model.Recruiter;

@Repository
public interface RecruiterRepository extends MongoRepository<Recruiter, String> {
}
