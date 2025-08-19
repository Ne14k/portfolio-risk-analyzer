package com.portfolio.riskanalyzer.model;

public enum AssetCategory {
    STOCKS("stocks"),
    ETFS("etfs"),
    CRYPTO("crypto"),
    BONDS("bonds"),
    REAL_ESTATE("realEstate"),
    CASH("cash"),
    COMMODITIES("commodities");

    private final String value;

    AssetCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AssetCategory fromValue(String value) {
        for (AssetCategory category : AssetCategory.values()) {
            if (category.value.equals(value)) {
                return category;
            }
        }
        throw new IllegalArgumentException("Unknown asset category: " + value);
    }
}