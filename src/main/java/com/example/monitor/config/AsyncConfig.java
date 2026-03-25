package com.example.monitor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {

    @Value("${app.monitor.thread-pool-size:5}")
    private int maxPoolSize;

    @Bean(name = "monitorTaskExecutor")
    public Executor monitorTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(maxPoolSize); // Requirements: Max concurrent checks = 5
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Monitor-");
        executor.initialize();
        return executor;
    }
}
