package com.jumble.userjob.candidate.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.jumble.userjob.candidate.model.Recruiter;

import java.util.Optional;

@Repository
public interface RecruiterRepository extends MongoRepository<Recruiter, String> {
    Optional<Recruiter> findByEmail(String email);
}
