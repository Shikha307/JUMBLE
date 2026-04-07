package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.SwipeRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MongoSwipeRecordRepository extends MongoRepository<SwipeRecord, String> {
    Optional<SwipeRecord> findByCandidateIdAndJobId(String candidateId, String jobId);

    // Find all records for a job where the recruiter has already swiped
    List<SwipeRecord> findByJobIdAndRecruiterSwipeIsNotNull(String jobId);

    // Find all records for a candidate where the candidate has already swiped (left or right)
    List<SwipeRecord> findByCandidateIdAndCandidateSwipeIsNotNull(String candidateId);
}
