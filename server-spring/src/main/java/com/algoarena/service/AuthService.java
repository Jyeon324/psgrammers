package com.algoarena.service;

import com.algoarena.entity.User;
import com.algoarena.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User getTestUser() {
        return userRepository.findByEmail("test@example.com")
                .orElseGet(this::createTestUser);
    }

    private User createTestUser() {
        User testUser = User.builder()
                .id(UUID.randomUUID().toString())
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .profileImageUrl("https://ui-avatars.com/api/?name=Test+User")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        return userRepository.save(testUser);
    }

    public void loginAsTestUser(HttpSession session) {
        User user = getTestUser();
        session.setAttribute("USER_ID", user.getId());
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public User getCurrentUser(HttpSession session) {
        String userId = (String) session.getAttribute("USER_ID");
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }
}
