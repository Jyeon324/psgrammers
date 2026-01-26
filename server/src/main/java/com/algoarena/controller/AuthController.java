package com.algoarena.controller;

import com.algoarena.entity.User;
import com.algoarena.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @GetMapping("/login")
    public void login(HttpSession session, HttpServletResponse response) throws IOException {
        authService.loginAsTestUser(session);
        response.sendRedirect("http://localhost:5001/");
    }

    @GetMapping("/logout")
    public void logout(HttpSession session, HttpServletResponse response) throws IOException {
        authService.logout(session);
        response.sendRedirect("http://localhost:5001/");
    }

    @GetMapping("/auth/user")
    public ResponseEntity<User> getUser(HttpSession session) {
        User user = authService.getCurrentUser(session);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }
}
