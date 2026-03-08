package com.jumble.userjob.job.repository;

import com.jumble.userjob.job.model.SwipeRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SwipeRepository extends MongoRepository<SwipeRecord, String> {

    Optional<SwipeRecord> findByCandidateIdAndJobId(String candidateId, String jobId);

    List<SwipeRecord> findByJobId(String jobId);

    List<SwipeRecord> findByCandidateId(String candidateId);

    List<SwipeRecord> findByCandidateIdAndMatched(String candidateId, boolean matched);

    List<SwipeRecord> findByJobIdAndMatched(String jobId, boolean matched);
}
