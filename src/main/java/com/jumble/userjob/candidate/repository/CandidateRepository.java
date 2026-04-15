package com.jumble.userjob.candidate.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.jumble.userjob.candidate.model.Candidate;

import java.util.Optional;

@Repository
public interface CandidateRepository extends MongoRepository<Candidate, String> {
    Optional<Candidate> findByEmail(String email);

    @Query(value = "{ '_id': ?0 }", fields = "{ 'resumeData': 0, 'resumes.data': 0 }")
    Optional<Candidate> findByIdWithoutResume(String id);

    // Fast auth lookup: include only fields needed to verify credentials.
    @Query(value = "{ 'email': ?0 }", fields = "{ 'email': 1, 'password': 1 }")
    Optional<Candidate> findAuthByEmail(String email);

    // Lightweight lookup for non-resume flows (login/profile metadata).
    @Query(value = "{ 'email': ?0 }", fields = "{ 'resumeData': 0, 'resumes.data': 0 }")
    Optional<Candidate> findByEmailWithoutResume(String email);
}
