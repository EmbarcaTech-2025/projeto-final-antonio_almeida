package com.api.springsuperheroes.domain.models;

import com.api.springsuperheroes.domain.user.UserRole;

import lombok.Getter;


public record RegisterDTO(String login, String password, UserRole role, String firstName, String lastName, String email,
        String mobile, String street, String city, String state, String country) {
    
            
}

