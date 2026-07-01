package com.paprika.domain.mypage.repository;

import com.paprika.domain.mypage.entity.MannerTemperature;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MannerTemperatureRepository extends JpaRepository<MannerTemperature, Long> {
    Optional<MannerTemperature> findByUserId(Long userId);
}