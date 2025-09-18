package com.api.springsuperheroes.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.springsuperheroes.domain.models.AuthenticationDTO;
import com.api.springsuperheroes.domain.models.LoginResponseDTO;
import com.api.springsuperheroes.domain.models.RegisterDTO;
import com.api.springsuperheroes.domain.models.RegisterResponseDTO;
import com.api.springsuperheroes.domain.user.User;
import com.api.springsuperheroes.domain.user.UserRole;
import com.api.springsuperheroes.infra.security.TokenService;
import com.api.springsuperheroes.services.AuthorizationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("api/auth")
public class AuthenticationController {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private AuthorizationService authorizationService;
    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data) throws Exception {
        Authentication auth;
        User user;
        UserRole userRole = null;
        String role = "";

        var usernamePassword = new UsernamePasswordAuthenticationToken(data.login(), data.password());

        try {
            auth = this.authenticationManager.authenticate(usernamePassword);
        } catch (AuthenticationException e) {
            throw new Exception(e);
        }
        var token = tokenService.generateToken((User) auth.getPrincipal());
        user = authorizationService.getRole(data.login());
        if (user != null)
            userRole = user.getRole();
        if (userRole == UserRole.ADMIN) {
            role = "ADMIN";
        } else {
            role = "USER";
        }
        return ResponseEntity.ok(new LoginResponseDTO(token, role));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterDTO data) {
        if (authorizationService.loadUserByUsername(data.login()) != null) {
            String errorMessage = "Usuário já cadastrado!";
            return ResponseEntity.badRequest().body(errorMessage);
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.password());

        User newUser = new User(data.email(), encryptedPassword, data.role(), data.firstName(), data.lastName(),
                data.email(), data.mobile(), data.street(), data.city(), data.state(), data.country());

        authorizationService.saveUser(newUser);

        return ResponseEntity.ok(data);
    }

    @GetMapping
    public ResponseEntity<List<RegisterResponseDTO>> receiveAllProducts() {
        List<RegisterResponseDTO> userList = this.authorizationService.getAllUsers();

        if (userList.isEmpty())
            return ResponseEntity.ok(userList);
        return ResponseEntity.ok(userList);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable String id) {
        Map<String, String> response = new HashMap<>();
        String resp = this.authorizationService.deleteUser(id);

        response.put("message", resp);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegisterResponseDTO> receiveUser(@PathVariable String id) {
        RegisterResponseDTO resp = this.authorizationService.requestUser(id);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, String>> updateUser(@RequestBody @Valid RegisterDTO registerObj,
            @PathVariable String userId) {
        Map<String, String> response = new HashMap<>();
        String resp = this.authorizationService.updateUser(registerObj, userId);

        response.put("message", resp);
        return ResponseEntity.ok(response);
    }
}
