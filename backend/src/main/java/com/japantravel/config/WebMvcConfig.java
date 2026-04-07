package com.japantravel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ./uploads/ 디렉토리를 /uploads/** URL로 서빙
        String uploadsRoot = Paths.get(uploadPath)
                .toAbsolutePath()
                .getParent()   // profiles/ → uploads/
                .getParent()   // uploads/ → 프로젝트 루트
                .resolve("uploads")
                .toUri()
                .toString();

        // 끝에 / 보장
        if (!uploadsRoot.endsWith("/")) {
            uploadsRoot = uploadsRoot + "/";
        }

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(uploadsRoot);
    }
}
