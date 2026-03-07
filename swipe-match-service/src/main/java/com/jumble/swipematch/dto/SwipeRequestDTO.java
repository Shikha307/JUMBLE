package com.jumble.swipematch.dto;

import com.jumble.swipematch.model.SwipeDirection;
import com.jumble.swipematch.model.UserRole;
import lombok.Data;

@Data
public class SwipeRequestDTO {
    private String candidateId;
    private String jobId;
    private UserRole swiperRole;
    private SwipeDirection direction;
}
