package com.jumble.userjob.candidate.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateResume {
    private String id = UUID.randomUUID().toString();
    private String fieldName;
    private String filename;
    private String contentType;
    
    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] data;
}
