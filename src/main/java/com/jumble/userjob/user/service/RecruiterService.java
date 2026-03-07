package com.jumble.userjob.user.service;

import com.jumble.userjob.user.model.Recruiter;
import com.jumble.userjob.user.repository.RecruiterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class RecruiterService {

    @Autowired
    private RecruiterRepository recruiterRepository;

    public Recruiter createRecruiter(Recruiter recruiter) {
        return recruiterRepository.save(recruiter);
    }

    public Optional<Recruiter> getRecruiterById(String id) {
        return recruiterRepository.findById(id);
    }
}
