package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Swipe;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SwipeRepository extends CrudRepository<Swipe, String> {
    List<Swipe> findByCandidateIdAndJobId(String candidateId, String jobId);
}
