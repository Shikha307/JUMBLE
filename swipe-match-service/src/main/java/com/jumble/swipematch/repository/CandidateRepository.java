package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Candidate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CandidateRepository extends MongoRepository<Candidate, String> {
}
