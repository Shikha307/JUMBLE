package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.SwipeRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MongoSwipeRecordRepository extends MongoRepository<SwipeRecord, String> {
    Optional<SwipeRecord> findByCandidateIdAndJobId(String candidateId, String jobId);
}
