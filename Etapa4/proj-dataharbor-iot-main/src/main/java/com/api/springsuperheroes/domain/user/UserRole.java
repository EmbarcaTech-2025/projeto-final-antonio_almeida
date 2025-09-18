package com.api.springsuperheroes.domain.user;

public enum UserRole {
    ADMIN("admin"),
    USER("user"),
    TEC("tec");

    private String role;

    UserRole(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
