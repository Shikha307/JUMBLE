package com.jumble.swipematch.service;

import com.jumble.swipematch.dto.SwipeRequestDTO;
import com.jumble.swipematch.model.Swipe;
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
    
    public void processSwipe(SwipeRequestDTO request) {
        Swipe swipe = Swipe.builder()
                .id(UUID.randomUUID().toString())
                .candidateId(request.getCandidateId())
                .jobId(request.getJobId())
                .swiperRole(request.getSwiperRole())
                .direction(request.getDirection())
                .timestamp(Instant.now())
                .build();
                
        // Store the swipe in Redis
        swipeRepository.save(swipe);
        log.info("Saved swipe: {}", swipe);
        
        // Asynchronously or synchronously trigger match detection
        // For simplicity, doing it synchronously here, but in production this should be an event sent to Kafka/RabbitMQ
        matchDetectionService.detectMatch(swipe);
    }
}
