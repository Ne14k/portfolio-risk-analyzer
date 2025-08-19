package com.portfolio.riskanalyzer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    @Bean("supabaseWebClient")
    public WebClient supabaseWebClient() {
        return WebClient.builder()
                .baseUrl(supabaseUrl + "/rest/v1")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Prefer", "return=representation")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }

    @Bean("mlServiceWebClient")
    public WebClient mlServiceWebClient() {
        return WebClient.builder()
                .baseUrl(mlServiceUrl)
                .defaultHeader("Content-Type", "application/json")
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(2 * 1024 * 1024))
                .build();
    }
}