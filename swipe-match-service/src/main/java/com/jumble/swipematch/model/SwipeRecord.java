package com.jumble.swipematch.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;

/**
 * Aggregated swipe state for a (candidateId, jobId) pair stored in MongoDB.
 * One document per pair — upserted every time either party swipes.
 * Reuses the shared SwipeDirection enum from this package.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "swipe_records")
@CompoundIndex(name = "candidate_job_idx", def = "{'candidateId': 1, 'jobId': 1}", unique = true)
public class SwipeRecord {

    @Id
    private String id;

    private String candidateId;
    private String jobId;

    /** RIGHT or LEFT — set when the candidate swipes on the job */
    private SwipeDirection candidateSwipe;

    /**
     * RIGHT or LEFT — set when the recruiter swipes on the candidate for this job
     */
    private SwipeDirection recruiterSwipe;

    /** true when both parties have swiped RIGHT */
    private boolean matched;
}
