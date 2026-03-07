package com.jumble.userjob.user.repository;

import com.jumble.userjob.user.model.Recruiter;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecruiterRepository extends MongoRepository<Recruiter, String> {
}
