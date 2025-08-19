package com.portfolio.riskanalyzer.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AssetAllocation {
    private double stocks;
    private double etfs;
    private double crypto;
    private double bonds;
    @JsonProperty("realEstate")
    private double realEstate;
    private double cash;
    private double commodities;

    public AssetAllocation() {}

    public AssetAllocation(double stocks, double etfs, double crypto, double bonds, 
                          double realEstate, double cash, double commodities) {
        this.stocks = stocks;
        this.etfs = etfs;
        this.crypto = crypto;
        this.bonds = bonds;
        this.realEstate = realEstate;
        this.cash = cash;
        this.commodities = commodities;
    }

    // Getters and setters
    public double getStocks() { return stocks; }
    public void setStocks(double stocks) { this.stocks = stocks; }

    public double getEtfs() { return etfs; }
    public void setEtfs(double etfs) { this.etfs = etfs; }

    public double getCrypto() { return crypto; }
    public void setCrypto(double crypto) { this.crypto = crypto; }

    public double getBonds() { return bonds; }
    public void setBonds(double bonds) { this.bonds = bonds; }

    public double getRealEstate() { return realEstate; }
    public void setRealEstate(double realEstate) { this.realEstate = realEstate; }

    public double getCash() { return cash; }
    public void setCash(double cash) { this.cash = cash; }

    public double getCommodities() { return commodities; }
    public void setCommodities(double commodities) { this.commodities = commodities; }
}