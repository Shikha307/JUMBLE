package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Candidate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CandidateRepository extends MongoRepository<Candidate, String> {
	@Query(value = "{ '_id': { '$in': ?0 } }", fields = "{ 'name': 1, 'email': 1, 'skills': 1, 'resumeFilename': 1, 'resumeContentType': 1, 'country': 1, 'university': 1, 'linkedin': 1, 'activeResumeId': 1 }")
	List<Candidate> findSlimByIdIn(Collection<String> ids);
}
