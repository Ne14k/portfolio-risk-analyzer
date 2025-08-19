package com.portfolio.riskanalyzer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PortfolioRiskAnalyzerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PortfolioRiskAnalyzerApplication.class, args);
    }
}