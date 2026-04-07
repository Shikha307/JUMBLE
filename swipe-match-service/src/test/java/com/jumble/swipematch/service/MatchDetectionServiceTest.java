package com.jumble.swipematch.service;

import com.jumble.swipematch.model.Match;
import com.jumble.swipematch.model.Swipe;
import com.jumble.swipematch.model.SwipeDirection;
import com.jumble.swipematch.model.UserRole;
import com.jumble.swipematch.repository.MatchRepository;
import com.jumble.swipematch.repository.SwipeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchDetectionServiceTest {

    @Mock
    private SwipeRepository swipeRepository;

    @Mock
    private MatchRepository matchRepository;

    @InjectMocks
    private MatchDetectionService matchDetectionService;

    @Test
    void detectMatch_WhenCandidateSwipesRightAndMutualRecruiterRightExists_CreatesMatch() {
        // Arrange
        Swipe latestSwipe = Swipe.builder()
                .id(UUID.randomUUID().toString())
                .candidateId("C1")
                .jobId("J1")
                .swiperRole(UserRole.CANDIDATE)
                .direction(SwipeDirection.RIGHT)
                .timestamp(Instant.now())
                .build();

        Swipe historicalRecruiterSwipe = Swipe.builder()
                .id(UUID.randomUUID().toString())
                .candidateId("C1")
                .jobId("J1")
                .swiperRole(UserRole.RECRUITER)
                .direction(SwipeDirection.RIGHT)
                .timestamp(Instant.now().minusSeconds(3600))
                .build();

        when(swipeRepository.findByCandidateIdAndJobId("C1", "J1"))
                .thenReturn(List.of(historicalRecruiterSwipe));

        // Act
        matchDetectionService.detectMatch(latestSwipe);

        // Assert
        verify(matchRepository, times(1)).save(any(Match.class));
    }

    @Test
    void detectMatch_WhenLeftSwipe_IgnoresAndReturns() {
        // Arrange
        Swipe latestSwipe = Swipe.builder()
                .id(UUID.randomUUID().toString())
                .candidateId("C1")
                .jobId("J1")
                .swiperRole(UserRole.CANDIDATE)
                .direction(SwipeDirection.LEFT)
                .timestamp(Instant.now())
                .build();

        // Act
        matchDetectionService.detectMatch(latestSwipe);

        // Assert
        verify(swipeRepository, never()).findByCandidateIdAndJobId(anyString(), anyString());
        verify(matchRepository, never()).save(any(Match.class));
    }
}
