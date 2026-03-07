package com.jumble.swipematch.controller;

import com.jumble.swipematch.dto.SwipeRequestDTO;
import com.jumble.swipematch.service.SwipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/swipes")
@RequiredArgsConstructor
public class SwipeController {

    private final SwipeService swipeService;

    @PostMapping
    public ResponseEntity<String> recordSwipe(@RequestBody SwipeRequestDTO request) {
        swipeService.processSwipe(request);
        return ResponseEntity.ok("Swipe recorded successfully");
    }
}
