package com.example.monitor.enums;

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
