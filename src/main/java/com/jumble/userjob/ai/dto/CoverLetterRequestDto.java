package com.jumble.userjob.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetterRequestDto {
    private String candidateName;
    private String jobDescription;
    private String resumeFilename;
    private String resumeBase64;
}