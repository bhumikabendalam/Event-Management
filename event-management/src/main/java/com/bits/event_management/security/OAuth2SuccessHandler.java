package com.bits.event_management.security;

import com.bits.event_management.model.AuthProvider;
import com.bits.event_management.model.Role;
import com.bits.event_management.model.User;
import com.bits.event_management.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final String cookieName;
    private final long expirationMs;
    private final String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepository,
                                 JwtUtil jwtUtil,
                                 @Value("${app.jwt.cookie-name}") String cookieName,
                                 @Value("${app.jwt.expiration-ms}") long expirationMs,
                                 @Value("${app.frontend-url}") String frontendUrl) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.cookieName = cookieName;
        this.expirationMs = expirationMs;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect.");
            return;
        }

        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String registrationId = oauthToken.getAuthorizedClientRegistrationId();
        OAuth2User oauthUser = oauthToken.getPrincipal();

        String email = null;
        String name = null;
        String providerId = oauthUser.getName();

        if ("google".equalsIgnoreCase(registrationId)) {
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");
        } else if ("github".equalsIgnoreCase(registrationId)) {
            email = oauthUser.getAttribute("email");
            name = oauthUser.getAttribute("name");
            if (email == null) {
                String login = oauthUser.getAttribute("login");
                email = login + "@github.com";
            }
            if (name == null) {
                name = oauthUser.getAttribute("login");
            }
        }

        if (email == null) {
            log.error("Email not found from OAuth2 provider: {}", registrationId);
            response.sendRedirect(frontendUrl + "/login?error=email_not_found");
            return;
        }

        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        String socialLink = provider.name().toLowerCase() + ":" + providerId;
        
        // 1. First search by social provider link in the combined providerId column
        Optional<User> userOptional = userRepository.findBySocialProviderId(socialLink);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            // Update last-used provider to record latest login channel
            user.setProvider(provider);
            userRepository.save(user);
        } else {
            // 2. If not found by social account link, look up by email address to link existing accounts
            Optional<User> emailUserOptional = userRepository.findByEmailIgnoreCase(email);
            if (emailUserOptional.isPresent()) {
                user = emailUserOptional.get();
                user.setProvider(provider);
                
                String currentLinks = user.getProviderId();
                if (currentLinks == null || currentLinks.trim().isEmpty()) {
                    user.setProviderId(socialLink);
                } else if (!currentLinks.contains(socialLink)) {
                    user.setProviderId(currentLinks + ";" + socialLink);
                }
                userRepository.save(user);
            } else {
                // 3. Otherwise, register a new account (e.g. temporary dummy account for private GitHub emails)
                user = User.builder()
                        .name(name != null ? name : email.split("@")[0])
                        .email(email)
                        .role(Role.ROLE_PARTICIPANT)
                        .provider(provider)
                        .providerId(socialLink)
                        .build();
                userRepository.save(user);
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMs / 1000));
        response.addCookie(cookie);

        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/auth-success?token=" + token);
    }
}
