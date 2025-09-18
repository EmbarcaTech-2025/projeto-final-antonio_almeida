package com.api.springsuperheroes.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.api.springsuperheroes.domain.models.RegisterDTO;
import com.api.springsuperheroes.domain.models.RegisterResponseDTO;
import com.api.springsuperheroes.domain.user.User;
import com.api.springsuperheroes.domain.user.UserRole;
import com.api.springsuperheroes.exceptions.UserNotFoundException;
import com.api.springsuperheroes.repositories.UserRepository;

import jakarta.validation.Valid;

@Service("authorizationService")
public class AuthorizationService implements UserDetailsService {

    @Autowired
    UserRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByLogin(username);
    }

    public User getRole(String login) {
        return repository.findUserByLogin(login);
    }

    public void saveUser(User newUser) {
        repository.save(newUser);
    }

    public List<RegisterResponseDTO> getAllUsers() {        
        return this.repository.findAll().stream().map(RegisterResponseDTO::new).toList();
    }

    public String deleteUser(String id) {
        if (id == null || !this.repository.existsById(id)) {
            throw new UserNotFoundException("Error 404 - " + id + " não existe!");
        }
        this.repository.deleteById(id);       
        return  "Registro de Usuário foi deletado com sucesso!";
    }

    public RegisterResponseDTO requestUser(String id) {
        Optional<User> optionalUser = this.repository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            RegisterResponseDTO registerResponseDTO = new RegisterResponseDTO(user);
            return (registerResponseDTO);
        } else {
            throw new UserNotFoundException("Error: " + id + " desconhecido!");
            
        }
        
    }
    
    public String updateUser(@Valid RegisterDTO registerObj, String id) {
        User existUser = this.repository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Error 404 - " + id + " não existe!"));
        // o login é o email
        existUser.setLogin(registerObj.email());
        existUser.setPassword(existUser.getPassword());
        if (registerObj.role()==UserRole.ADMIN) {
            existUser.setRole(UserRole.ADMIN);            
        } else if(registerObj.role()==UserRole.USER) {
            existUser.setRole(UserRole.USER);     
        } else {
            existUser.setRole(UserRole.TEC);
        }
        existUser.setFirstname(registerObj.firstName());
        existUser.setLastname(registerObj.lastName());
        existUser.setEmail(registerObj.email());
        existUser.setMobile(registerObj.mobile());
        existUser.setStreet(registerObj.street());
        existUser.setCity(registerObj.city());
        existUser.setState(registerObj.state());
        existUser.setCountry(registerObj.country());

        this.repository.save(existUser);
        return "Usuário foi alterado com sucesso!";
    }
}
