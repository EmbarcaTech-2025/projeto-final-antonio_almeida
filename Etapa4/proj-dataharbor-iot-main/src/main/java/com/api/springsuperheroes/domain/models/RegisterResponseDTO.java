package com.api.springsuperheroes.domain.models;

import com.api.springsuperheroes.domain.user.User;
import com.api.springsuperheroes.domain.user.UserRole;

public record RegisterResponseDTO(String id, String login, String password, UserRole role, String firstName,
        String lastName,
        String email,
        String mobile, String street,
        String city, String state,
        String country) {

    public RegisterResponseDTO(User user) {
        this(user.getId(), user.getLogin(), user.getPassword(),
                user.getRole(), user.getFirstname(), user.getFirstname(),
                user.getEmail(), user.getMobile(), user.getStreet(), user.getCity(), user.getState(),
                user.getCountry());
    }

}