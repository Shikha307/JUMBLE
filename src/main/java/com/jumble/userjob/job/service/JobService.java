package com.jumble.userjob.job.service;

import com.jumble.userjob.job.model.Job;
import com.jumble.userjob.job.model.SwipeRecord;
import com.jumble.userjob.job.model.SwipeRecord.SwipeDirection;
import com.jumble.userjob.job.repository.JobRepository;
import com.jumble.userjob.job.repository.SwipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SwipeRepository swipeRepository;

    // ── Job CRUD ────────────────────────────────────────────────────────────

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    public Optional<Job> getJobById(String id) {
        return jobRepository.findById(id);
    }

    public List<Job> getJobsBySkills(List<String> skills) {
        if (skills == null || skills.isEmpty()) {
            return getAllJobs();
        }
        return jobRepository.findBySkillsNeededIn(skills)
                .stream()
                .distinct()
                .collect(Collectors.toList());
    }

    public void deleteJob(String id) {
        jobRepository.deleteById(id);
    }

    // ── Swipe logic ─────────────────────────────────────────────────────────

    /**
     * Called when a candidate swipes right or left on a job.
     * Creates the record if it doesn't exist yet; updates it if it does.
     * Recalculates the match flag after saving.
     */
    public SwipeRecord recordCandidateSwipe(String candidateId, String jobId, SwipeDirection direction) {
        SwipeRecord record = swipeRepository
                .findByCandidateIdAndJobId(candidateId, jobId)
                .orElse(new SwipeRecord(null, candidateId, jobId, null, null, false));

        record.setCandidateSwipe(direction);
        record.setMatched(direction == SwipeDirection.RIGHT
                && record.getRecruiterSwipe() == SwipeDirection.RIGHT);

        return swipeRepository.save(record);
    }

    /**
     * Called when a recruiter swipes right or left on a candidate for a specific
     * job.
     * Creates the record if it doesn't exist yet; updates it if it does.
     * Recalculates the match flag after saving.
     */
    public SwipeRecord recordRecruiterSwipe(String candidateId, String jobId, SwipeDirection direction) {
        SwipeRecord record = swipeRepository
                .findByCandidateIdAndJobId(candidateId, jobId)
                .orElse(new SwipeRecord(null, candidateId, jobId, null, null, false));

        record.setRecruiterSwipe(direction);
        record.setMatched(direction == SwipeDirection.RIGHT
                && record.getCandidateSwipe() == SwipeDirection.RIGHT);

        return swipeRepository.save(record);
    }

    /** All swipe records for a given job. */
    public List<SwipeRecord> getSwipesForJob(String jobId) {
        return swipeRepository.findByJobId(jobId);
    }

    /** All swipe records for a given candidate. */
    public List<SwipeRecord> getSwipesForCandidate(String candidateId) {
        return swipeRepository.findByCandidateId(candidateId);
    }

    /** All matched (mutual right-swipe) records for a candidate. */
    public List<SwipeRecord> getMatchesForCandidate(String candidateId) {
        return swipeRepository.findByCandidateIdAndMatched(candidateId, true);
    }

    /** All matched records for a job. */
    public List<SwipeRecord> getMatchesForJob(String jobId) {
        return swipeRepository.findByJobIdAndMatched(jobId, true);
    }
}
