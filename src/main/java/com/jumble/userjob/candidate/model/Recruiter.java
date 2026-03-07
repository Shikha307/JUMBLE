package com.jumble.userjob.candidate.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "recruiters")
public class Recruiter {
    @Id
    private String id;
    private String name;
    private String email;
    private String company;
}
