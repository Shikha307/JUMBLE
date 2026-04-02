package com.jumble.userjob.ai.service;

import com.jumble.userjob.ai.dto.CoverLetterRequestDto;
import com.jumble.userjob.ai.dto.CoverLetterResponseDto;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CoverLetterClientService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String AI_SERVICE_URL = "http://localhost:8000/generate-cover-letter";

    public CoverLetterResponseDto generateCoverLetter(CoverLetterRequestDto requestDto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CoverLetterRequestDto> requestEntity = new HttpEntity<>(requestDto, headers);

        ResponseEntity<CoverLetterResponseDto> response = restTemplate.exchange(
                AI_SERVICE_URL,
                HttpMethod.POST,
                requestEntity,
                CoverLetterResponseDto.class
        );

        return response.getBody();
    }
}