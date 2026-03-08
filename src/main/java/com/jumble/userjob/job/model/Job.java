package com.jumble.userjob.job.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "jobs")
public class Job {
    @Id
    private String id;
    private String recruiterId; // Reference to the recruiter who posted
    private String roleName;
    private String description;
    private String country;
    private List<String> skillsNeeded;
}
