package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;

public class TaxPreferences {
    
    @DecimalMin(value = "0.0", message = "Tax bracket must be between 0 and 0.5")
    @DecimalMax(value = "0.5", message = "Tax bracket must be between 0 and 0.5")
    private Double taxBracket = 0.25;
    
    private Boolean preferTaxEfficient = true;
    
    @Pattern(regexp = "taxable|ira|401k|roth", message = "Account type must be taxable, ira, 401k, or roth")
    private String accountType = "taxable";

    public Double getTaxBracket() {
        return taxBracket;
    }

    public void setTaxBracket(Double taxBracket) {
        this.taxBracket = taxBracket;
    }

    public Boolean getPreferTaxEfficient() {
        return preferTaxEfficient;
    }

    public void setPreferTaxEfficient(Boolean preferTaxEfficient) {
        this.preferTaxEfficient = preferTaxEfficient;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
}