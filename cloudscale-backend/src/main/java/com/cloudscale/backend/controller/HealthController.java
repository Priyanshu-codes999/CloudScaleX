
package com.cloudscale.backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public Map<String, String> checkHealth() {
        return Map.of(
            "project", "CloudScale X",
            "status", "Running",
            "message", "CloudScale X backend is working!"
        );
    }
}
