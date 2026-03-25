package com.example.monitor.model;

public enum SubscriptionPlan {
    FREE(3),
    PRO(10);

    private final int maxServers;

    SubscriptionPlan(int maxServers) {
        this.maxServers = maxServers;
    }

    public int getMaxServers() {
        return maxServers;
    }
}
