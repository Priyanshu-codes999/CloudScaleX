
package com.cloudscale.backend.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudscale.backend.entity.User;
import com.cloudscale.backend.entity.Workload;
import com.cloudscale.backend.exception.ResourceNotFoundException;
import com.cloudscale.backend.repository.UserRepository;
import com.cloudscale.backend.repository.WorkloadRepository;

@Service
public class WorkloadService {

    private final WorkloadRepository repository;
    private final UserRepository userRepository;

    public WorkloadService(
            WorkloadRepository repository,
            UserRepository userRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
    }

    // Get currently authenticated user
    private User getCurrentUser() {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                    new ResourceNotFoundException("User not found"));
    }

    // CREATE
    @Transactional
    public Workload createWorkload(Workload workload) {

        User currentUser = getCurrentUser();

        // Never trust an owner supplied by the frontend
        workload.setOwner(currentUser);

        return repository.save(workload);
    }

    // READ ALL - Only current user's workloads
    @Transactional(readOnly = true)
    public List<Workload> getAllWorkloads() {

        User currentUser = getCurrentUser();

        return repository.findAllByOwner_Id(currentUser.getId());
    }

    // READ BY ID - Verify ownership
    @Transactional(readOnly = true)
    public Workload getWorkloadById(Long id) {

        User currentUser = getCurrentUser();

        return repository.findByIdAndOwner_Id(
                id,
                currentUser.getId()
        ).orElseThrow(() ->
            new ResourceNotFoundException("Workload not found"));
    }

    // UPDATE - Only owner can update
    @Transactional
    public Workload updateWorkload(
            Long id,
            Workload updatedWorkload) {

        Workload existingWorkload = getWorkloadById(id);

        existingWorkload.setApplicationName(
                updatedWorkload.getApplicationName());

        existingWorkload.setCpuCores(
                updatedWorkload.getCpuCores());

        existingWorkload.setRamGb(
                updatedWorkload.getRamGb());

        existingWorkload.setExpectedUsers(
                updatedWorkload.getExpectedUsers());

        existingWorkload.setMonthlyBudget(
                updatedWorkload.getMonthlyBudget());

        return repository.save(existingWorkload);
    }

    // DELETE - Only owner can delete
    @Transactional
    public void deleteWorkload(Long id) {

        Workload existingWorkload = getWorkloadById(id);

        repository.delete(existingWorkload);
    }
}
