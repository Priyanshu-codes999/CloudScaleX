
package com.cloudscale.backend.dto.auth;

public record AuthResponse(
    String token,
    String tokenType,
    Long userId,
    String email
) {}
