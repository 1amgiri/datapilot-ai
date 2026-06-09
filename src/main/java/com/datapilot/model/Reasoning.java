package com.datapilot.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Reasoning {
    private String decision;
    private String reasoning;
    private List<String> assumptions;
    private List<String> alternatives;
    private Integer confidenceScore;
}
