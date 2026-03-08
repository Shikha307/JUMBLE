package com.jumble.swipematch.service;

import com.jumble.swipematch.dto.SwipeRequestDTO;
import com.jumble.swipematch.model.Swipe;
import com.jumble.swipematch.model.SwipeDirection;
import com.jumble.swipematch.model.SwipeRecord;
import com.jumble.swipematch.model.UserRole;
import com.jumble.swipematch.repository.MongoSwipeRecordRepository;
import com.jumble.swipematch.repository.SwipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SwipeService {

    private final SwipeRepository swipeRepository;
    private final MatchDetectionService matchDetectionService;
    private final MongoSwipeRecordRepository mongoSwipeRecordRepository;
    private final com.jumble.swipematch.repository.CandidateRepository candidateRepository;
    private final com.jumble.swipematch.repository.JobRepository jobRepository;

    /**
     * Central method — ALL swipe processing goes through here.
     *
     * Step 1: Build and save the individual Swipe event to Redis.
     * Step 2: Upsert the aggregated SwipeRecord in MongoDB
     * (one document per candidateId+jobId pair, tracks both parties'
     * swipes and the matched flag).
     * Step 3: Check match detection (also writes a Match to Redis if matched).
     */
    public Swipe processSwipe(SwipeRequestDTO request) {

        // ── Step 1: Save individual swipe event to Redis ──────────────────────
        Swipe swipe = Swipe.builder()
                .id(UUID.randomUUID().toString())
                .candidateId(request.getCandidateId())
                .jobId(request.getJobId())
                .recruiterId(request.getRecruiterId())
                .swiperRole(request.getSwiperRole())
                .direction(request.getDirection())
                .timestamp(Instant.now())
                .build();

        swipeRepository.save(swipe);
        log.info("Redis — swipe saved: role={}, candidateId={}, jobId={}, direction={}",
                swipe.getSwiperRole(), swipe.getCandidateId(), swipe.getJobId(), swipe.getDirection());

        // ── Step 2: Upsert aggregated SwipeRecord in MongoDB ──────────────────
        upsertMongoSwipeRecord(request);

        // ── Step 3: Trigger match detection (updates Redis Match hash) ────────
        matchDetectionService.detectMatch(swipe);

        return swipe;
    }

    /**
     * Finds or creates the SwipeRecord document for this (candidateId, jobId) pair,
     * updates the correct swipe direction field based on the swiper's role,
     * recalculates the matched flag, and saves back to MongoDB.
     */
    private void upsertMongoSwipeRecord(SwipeRequestDTO request) {
        String candidateId = request.getCandidateId();
        String jobId = request.getJobId();
        SwipeDirection dir = request.getDirection();

        SwipeRecord record = mongoSwipeRecordRepository
                .findByCandidateIdAndJobId(candidateId, jobId)
                .orElse(new SwipeRecord(null, candidateId, jobId, null, null, false));

        if (request.getSwiperRole() == UserRole.CANDIDATE) {
            record.setCandidateSwipe(dir);
        } else {
            record.setRecruiterSwipe(dir);
        }

        record.setMatched(
                record.getCandidateSwipe() == SwipeDirection.RIGHT &&
                        record.getRecruiterSwipe() == SwipeDirection.RIGHT);

        mongoSwipeRecordRepository.save(record);
        log.info("MongoDB — swipe_records upserted: candidateId={}, jobId={}, matched={}",
                candidateId, jobId, record.isMatched());
    }

    /**
     * Returns a list of *unswiped* Candidate objects for a specific job,
     * optionally filtered by country.
     */
    public java.util.List<com.jumble.swipematch.model.Candidate> getUnswipedCandidatesForJob(String jobId, String country) {
        java.util.List<String> swipedIds = mongoSwipeRecordRepository.findByJobIdAndRecruiterSwipeIsNotNull(jobId)
                .stream()
                .map(SwipeRecord::getCandidateId)
                .toList();

        return candidateRepository.findAll()
                .stream()
                .filter(candidate -> !swipedIds.contains(candidate.getId()))
                .filter(candidate -> country == null || country.isEmpty() || country.equalsIgnoreCase(candidate.getCountry()))
                .toList();
    }

    /**
     * Returns a list of *unswiped* Job objects for a specific candidate.
     * Excludes any job the candidate has already swiped left or right on.
     */
    public java.util.List<com.jumble.swipematch.model.Job> getUnswipedJobsForCandidate(String candidateId) {
        java.util.List<String> swipedJobIds = mongoSwipeRecordRepository
                .findByCandidateIdAndCandidateSwipeIsNotNull(candidateId)
                .stream()
                .map(SwipeRecord::getJobId)
                .toList();

        return jobRepository.findAll()
                .stream()
                .filter(job -> !swipedJobIds.contains(job.getId()))
                .toList();
    }
}
