package com.jumble.swipematch.service;

import com.jumble.swipematch.model.Match;
import com.jumble.swipematch.model.Swipe;
import com.jumble.swipematch.model.SwipeDirection;
import com.jumble.swipematch.model.UserRole;
import com.jumble.swipematch.repository.MatchRepository;
import com.jumble.swipematch.repository.SwipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchDetectionService {
    
    private final SwipeRepository swipeRepository;
    private final MatchRepository matchRepository;
    
    public void detectMatch(Swipe latestSwipe) {
        // We only care if the latest swipe is a RIGHT swipe (a "LIKE")
        if (latestSwipe.getDirection() != SwipeDirection.RIGHT) {
            return;
        }
        
        // Find existing swipes for the same candidate and job
        List<Swipe> historicalSwipes = swipeRepository.findByCandidateIdAndJobId(
                latestSwipe.getCandidateId(), 
                latestSwipe.getJobId()
        );
        
        // Look for a right swipe from the *other* party
        UserRole requiredCounterpartyRole = (latestSwipe.getSwiperRole() == UserRole.CANDIDATE) 
                ? UserRole.RECRUITER 
                : UserRole.CANDIDATE;
                
        boolean mutualRightSwipeExists = historicalSwipes.stream()
                .anyMatch(s -> s.getSwiperRole() == requiredCounterpartyRole && 
                               s.getDirection() == SwipeDirection.RIGHT);
                               
        if (mutualRightSwipeExists) {
            // A match is found!
            Match match = Match.builder()
                    .id(UUID.randomUUID().toString())
                    .candidateId(latestSwipe.getCandidateId())
                    .jobId(latestSwipe.getJobId())
                    .matchedAt(Instant.now())
                    .build();
                    
            matchRepository.save(match);
            log.info("🔥 It's a MATCH! Candidate: {} and Job: {}", match.getCandidateId(), match.getJobId());
            
            // Here you could publish a message to a broker (like Kafka) so the Chat service can create a chatroom.
        }
    }
}
