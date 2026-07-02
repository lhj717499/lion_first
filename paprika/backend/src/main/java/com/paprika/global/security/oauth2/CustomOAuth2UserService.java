package com.paprika.global.security.oauth2;

import com.paprika.domain.auth.entity.User;
import com.paprika.domain.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest request) {
        OAuth2User oAuth2User = super.loadUser(request);
        String registrationId = request.getClientRegistration().getRegistrationId();

        OAuth2UserInfo userInfo = extractUserInfo(registrationId, oAuth2User.getAttributes());

        User user = userRepository.findByProviderAndProviderId(userInfo.provider(), userInfo.providerId())
                .orElseGet(() -> userRepository.findByEmail(userInfo.email())
                        .orElseGet(() -> createUser(userInfo)));

        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    @SuppressWarnings("unchecked")
    private OAuth2UserInfo extractUserInfo(String registrationId, Map<String, Object> attributes) {
        return switch (registrationId) {
            case "google" -> new OAuth2UserInfo(
                    (String) attributes.get("email"),
                    (String) attributes.get("name"),
                    (String) attributes.get("picture"),
                    String.valueOf(attributes.get("sub")),
                    User.Provider.GOOGLE
            );
            case "naver" -> {
                Map<String, Object> response = (Map<String, Object>) attributes.get("response");
                yield new OAuth2UserInfo(
                        (String) response.get("email"),
                        (String) response.get("name"),
                        (String) response.get("profile_image"),
                        String.valueOf(response.get("id")),
                        User.Provider.NAVER
                );
            }
            case "github" -> {
                String email = (String) attributes.get("email");
                if (email == null) {
                    email = attributes.get("id") + "@github.paprika";
                }
                yield new OAuth2UserInfo(
                        email,
                        (String) attributes.get("login"),
                        (String) attributes.get("avatar_url"),
                        String.valueOf(attributes.get("id")),
                        User.Provider.GITHUB
                );
            }
            default -> throw new IllegalArgumentException("Unknown provider: " + registrationId);
        };
    }

    private User createUser(OAuth2UserInfo info) {
        String nickname = generateUniqueNickname(info.name());
        return userRepository.save(User.builder()
                .email(info.email())
                .nickname(nickname)
                .profileImageUrl(info.profileImageUrl())
                .provider(info.provider())
                .providerId(info.providerId())
                .role(User.Role.USER)
                .build());
    }

    private String generateUniqueNickname(String baseName) {
        String base = (baseName != null ? baseName : "user").substring(0, Math.min((baseName != null ? baseName : "user").length(), 8));
        if (!userRepository.existsByNickname(base)) {
            return base;
        }
        String candidate;
        do {
            candidate = base.substring(0, Math.min(base.length(), 6)) + UUID.randomUUID().toString().substring(0, 4);
        } while (userRepository.existsByNickname(candidate));
        return candidate;
    }

    private record OAuth2UserInfo(
            String email,
            String name,
            String profileImageUrl,
            String providerId,
            User.Provider provider
    ) {}
}
