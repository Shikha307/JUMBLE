package com.jumble.swipematch.repository;

import com.jumble.swipematch.model.Job;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface JobRepository extends MongoRepository<Job, String> {
	List<Job> findByIdNotIn(Collection<String> ids);
}
