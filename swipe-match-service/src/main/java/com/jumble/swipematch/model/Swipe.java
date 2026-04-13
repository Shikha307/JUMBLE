package com.jumble.swipematch.model;

import lombok.Data;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@Document(collection = "swipes")
public class Swipe {
    @Id
    private String id;
    
    @Indexed
    private String candidateId;
    
    @Indexed
    private String jobId;
    
    @Indexed
    private String recruiterId;
    
    private UserRole swiperRole;
    private SwipeDirection direction;
    private Instant timestamp;
    private String resumeId;
}
