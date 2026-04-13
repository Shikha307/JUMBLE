package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Swipe;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SwipeRepository extends MongoRepository<Swipe, String> {
    List<Swipe> findByCandidateIdAndJobId(String candidateId, String jobId);
}
