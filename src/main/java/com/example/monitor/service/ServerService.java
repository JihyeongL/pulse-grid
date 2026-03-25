package com.example.monitor.service;

import com.example.monitor.model.Server;
import com.example.monitor.model.User;
import com.example.monitor.repository.ServerRepository;
import com.example.monitor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final UserRepository userRepository;

    @Transactional
    public Server createServer(Long userId, Server server) {
        if (server.getCheckIntervalMinutes() < 5) {
            throw new IllegalArgumentException("Minimum check interval is 5 minutes");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int maxServers = user.getPlan().getMaxServers();
        long count = serverRepository.countByUserId(userId);

        if (count >= maxServers) {
            throw new IllegalStateException(
                    "User has reached the maximum number of servers (" + maxServers + ") for their " + user.getPlan()
                            + " plan.");
        }

        server.setUserId(userId);
        return serverRepository.save(server);
    }

    @Transactional(readOnly = true)
    public List<Server> getUserServers(Long userId) {
        return serverRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Server getServer(Long id, Long userId) {
        Server server = serverRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Server not found"));

        if (!server.getUserId().equals(userId)) {
            throw new IllegalStateException("Unauthorized access to server");
        }
        return server;
    }

    @Transactional
    public Server updateServer(Long id, Long userId, Server updatedServer) {
        Server server = getServer(id, userId);

        if (updatedServer.getCheckIntervalMinutes() < 5) {
            throw new IllegalArgumentException("Minimum check interval is 5 minutes");
        }

        server.setName(updatedServer.getName());
        server.setIpAddress(updatedServer.getIpAddress());
        server.setPort(updatedServer.getPort());
        server.setCheckIntervalMinutes(updatedServer.getCheckIntervalMinutes());

        return serverRepository.save(server);
    }

    @Transactional
    public void deleteServer(Long id, Long userId) {
        Server server = getServer(id, userId);
        serverRepository.delete(server);
    }
}
