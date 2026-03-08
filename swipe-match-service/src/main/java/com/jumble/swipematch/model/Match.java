package com.jumble.swipematch.model;

import lombok.Data;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.Instant;

@Data
@Builder
@Document(collection = "matches")
public class Match {
    @Id
    private String id;
    @Indexed
    private String candidateId;
    @Indexed
    private String jobId;
    @Indexed
    private String recruiterId;
    private Instant matchedAt;
}
