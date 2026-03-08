package com.jumble.userjob.candidate.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "candidates")
public class Candidate {
    @Id
    private String id;
    private String name;
    private String email;
    private List<String> skills;
    private String resumeFilename;
    private String resumeContentType;
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] resumeData;
}
