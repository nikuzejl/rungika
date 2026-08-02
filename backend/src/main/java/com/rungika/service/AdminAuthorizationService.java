package com.rungika.service;

import com.rungika.repository.AdminPrivilegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthorizationService {
    @Autowired
    private AdminPrivilegeRepository adminPrivilegeRepository;

    public boolean canManageOrders(Authentication authentication, String email) {
        if (authentication == null || !authentication.isAuthenticated() || email == null || email.isBlank()) {
            return false;
        }

        boolean hasAdminRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        return hasAdminRole || adminPrivilegeRepository.existsByEmailIgnoreCase(email.trim());
    }
}
