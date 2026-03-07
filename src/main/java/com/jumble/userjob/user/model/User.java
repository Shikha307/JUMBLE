package com.jumble.userjob.user.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private List<String> skills;
    private String resumeFilename;
    private String resumeContentType;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] resumeData; // Stored directly in MongoDB as BSON binary
}
