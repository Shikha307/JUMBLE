package com.jumble.userjob.ai.service;

import com.jumble.userjob.ai.dto.CoverLetterRequestDto;
import com.jumble.userjob.ai.dto.CoverLetterResponseDto;
import org.springframework.http.HttpStatusCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
public class CoverLetterClientService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${AI_SERVICE_URL:http://localhost:8000/generate-cover-letter}")
    private String aiServiceUrl;

    public CoverLetterResponseDto generateCoverLetter(CoverLetterRequestDto requestDto) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<CoverLetterRequestDto> requestEntity = new HttpEntity<>(requestDto, headers);
        try {
            ResponseEntity<CoverLetterResponseDto> response = restTemplate.exchange(
                aiServiceUrl,
                HttpMethod.POST,
                requestEntity,
                CoverLetterResponseDto.class
            );
            return response.getBody();
        } catch (HttpStatusCodeException ex) {
            HttpStatusCode status = ex.getStatusCode();
            String body = ex.getResponseBodyAsString();
            throw new org.springframework.web.server.ResponseStatusException(
                status,
                (body == null || body.isBlank()) ? "AI service request failed" : body,
                ex
            );
        }
    }
}