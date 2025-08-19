package com.portfolio.riskanalyzer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class PortfolioAllocation {

    @NotNull
    @DecimalMin(value = "0.0", message = "Stock allocation must be non-negative")
    @DecimalMax(value = "1.0", message = "Stock allocation must not exceed 100%")
    private Double stocks;

    @NotNull
    @DecimalMin(value = "0.0", message = "Bond allocation must be non-negative")
    @DecimalMax(value = "1.0", message = "Bond allocation must not exceed 100%")
    private Double bonds;

    @NotNull
    @DecimalMin(value = "0.0", message = "Alternatives allocation must be non-negative")
    @DecimalMax(value = "1.0", message = "Alternatives allocation must not exceed 100%")
    private Double alternatives;

    @NotNull
    @DecimalMin(value = "0.0", message = "Cash allocation must be non-negative")
    @DecimalMax(value = "1.0", message = "Cash allocation must not exceed 100%")
    private Double cash;

    public PortfolioAllocation() {}

    public PortfolioAllocation(Double stocks, Double bonds, Double alternatives, Double cash) {
        this.stocks = stocks;
        this.bonds = bonds;
        this.alternatives = alternatives;
        this.cash = cash;
    }

    public Double getStocks() {
        return stocks;
    }

    public void setStocks(Double stocks) {
        this.stocks = stocks;
    }

    public Double getBonds() {
        return bonds;
    }

    public void setBonds(Double bonds) {
        this.bonds = bonds;
    }

    public Double getAlternatives() {
        return alternatives;
    }

    public void setAlternatives(Double alternatives) {
        this.alternatives = alternatives;
    }

    public Double getCash() {
        return cash;
    }

    public void setCash(Double cash) {
        this.cash = cash;
    }

    public boolean isValidAllocation() {
        double total = stocks + bonds + alternatives + cash;
        return Math.abs(total - 1.0) < 0.01;
    }
}