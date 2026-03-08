package com.jumble.swipematch.service;

import com.jumble.swipematch.model.Match;
import com.jumble.swipematch.model.Swipe;
import com.jumble.swipematch.model.SwipeDirection;
import com.jumble.swipematch.model.UserRole;
import com.jumble.swipematch.model.SwipeRecord;
import com.jumble.swipematch.repository.MatchRepository;
import com.jumble.swipematch.repository.MongoSwipeRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchDetectionService {
    
    private final MongoSwipeRecordRepository swipeRecordRepository;
    private final MatchRepository matchRepository;
    
    public void detectMatch(Swipe latestSwipe) {
        if (latestSwipe.getDirection() != SwipeDirection.RIGHT) {
            return;
        }
        
        Optional<SwipeRecord> recordOpt = swipeRecordRepository.findByCandidateIdAndJobId(
                latestSwipe.getCandidateId(), 
                latestSwipe.getJobId()
        );
        
        if (recordOpt.isPresent() && recordOpt.get().isMatched()) {
            SwipeRecord record = recordOpt.get();
            
            // Ensure we don't duplicate a Match if one already exists for this pair
            List<Match> existingMatches = matchRepository.findByCandidateId(record.getCandidateId());
            boolean matchAlreadyExists = existingMatches.stream()
                    .anyMatch(m -> m.getJobId().equals(record.getJobId()));
                    
            if (!matchAlreadyExists) {
                String recruiterId = latestSwipe.getRecruiterId();
                
                // If it's the candidate swiping right to trigger the match, the payload might not have 
                // the recruiterId. Let's fetch it explicitly from the Job Service to be 100% safe.
                if (recruiterId == null || recruiterId.isEmpty() || recruiterId.equals("R1")) {
                    try {
                        RestTemplate restTemplate = new RestTemplate();
                        String jobUrl = "http://host.docker.internal:8081/api/jobs/" + record.getJobId();
                        Map<String, Object> jobResponse = restTemplate.getForObject(jobUrl, Map.class);
                        if (jobResponse != null && jobResponse.containsKey("recruiterId")) {
                            recruiterId = (String) jobResponse.get("recruiterId");
                        }
                    } catch (Exception e) {
                        log.error("Failed to fetch recruiterId for jobId: " + record.getJobId(), e);
                    }
                }

                if (recruiterId == null) {
                    log.warn("Could not determine recruiterId for matched jobId {}. Skipping Match creation.", record.getJobId());
                    return;
                }

                // A match is found!
                Match match = Match.builder()
                        .id(UUID.randomUUID().toString())
                        .candidateId(record.getCandidateId())
                        .jobId(record.getJobId())
                        .recruiterId(recruiterId)
                        .matchedAt(Instant.now())
                        .build();
                        
                matchRepository.save(match);
                log.info("🔥 It's a MATCH! Candidate: {} and Job: {} (Recruiter: {})", match.getCandidateId(), match.getJobId(), match.getRecruiterId());
            }
        }
    }
}
