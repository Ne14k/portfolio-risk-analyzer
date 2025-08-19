package com.portfolio.riskanalyzer.dto;

public class AssetAllocationDto {
    private Double stocks;
    private Double etfs;
    private Double crypto;
    private Double bonds;
    private Double realEstate;
    private Double cash;
    private Double commodities;

    public AssetAllocationDto() {}

    public AssetAllocationDto(Double stocks, Double etfs, Double crypto, Double bonds, 
                             Double realEstate, Double cash, Double commodities) {
        this.stocks = stocks;
        this.etfs = etfs;
        this.crypto = crypto;
        this.bonds = bonds;
        this.realEstate = realEstate;
        this.cash = cash;
        this.commodities = commodities;
    }

    public Double getStocks() {
        return stocks;
    }

    public void setStocks(Double stocks) {
        this.stocks = stocks;
    }

    public Double getEtfs() {
        return etfs;
    }

    public void setEtfs(Double etfs) {
        this.etfs = etfs;
    }

    public Double getCrypto() {
        return crypto;
    }

    public void setCrypto(Double crypto) {
        this.crypto = crypto;
    }

    public Double getBonds() {
        return bonds;
    }

    public void setBonds(Double bonds) {
        this.bonds = bonds;
    }

    public Double getRealEstate() {
        return realEstate;
    }

    public void setRealEstate(Double realEstate) {
        this.realEstate = realEstate;
    }

    public Double getCash() {
        return cash;
    }

    public void setCash(Double cash) {
        this.cash = cash;
    }

    public Double getCommodities() {
        return commodities;
    }

    public void setCommodities(Double commodities) {
        this.commodities = commodities;
    }
}