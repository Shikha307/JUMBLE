package com.jumble.userjob.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterRegisterRequest {
    private String name;
    private String email;
    private String companyName;
    private String password;
}
