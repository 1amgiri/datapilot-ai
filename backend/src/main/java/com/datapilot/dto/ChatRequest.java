package com.datapilot.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private Long projectId; // optional database reference
    
    @NotBlank(message = "Question cannot be blank")
    private String question;
    
    // Optional context artifact string of the current state of generated project
    private String contextJson;
}
