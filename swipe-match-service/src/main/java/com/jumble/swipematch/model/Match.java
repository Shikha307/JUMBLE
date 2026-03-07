package com.jumble.swipematch.model;

import lombok.Data;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.time.Instant;

@Data
@Builder
@RedisHash("Match")
public class Match {
    @Id
    private String id;
    @Indexed
    private String candidateId;
    @Indexed
    private String jobId;
    private Instant matchedAt;
}
