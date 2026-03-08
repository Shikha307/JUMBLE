package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Match;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends CrudRepository<Match, String> {
    List<Match> findByCandidateId(String candidateId);
    List<Match> findByJobId(String jobId);
    List<Match> findByRecruiterId(String recruiterId);
}
