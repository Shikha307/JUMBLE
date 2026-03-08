package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Match;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends MongoRepository<Match, String> {
    List<Match> findByCandidateId(String candidateId);
    List<Match> findByJobId(String jobId);
    List<Match> findByRecruiterId(String recruiterId);
}
