package com.api.springsuperheroes.exceptions;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class ApiError {
    private HttpStatus status;
    private String message;

    public ApiError(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
