package com.jumble.userjob.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterRequestDto {
    @JsonProperty("candidate_name")
    private String candidateName;

    @JsonProperty("job_description")
    private String jobDescription;

    @JsonProperty("resume_filename")
    private String resumeFilename;

    @JsonProperty("resume_base64")
    private String resumeBase64;
}