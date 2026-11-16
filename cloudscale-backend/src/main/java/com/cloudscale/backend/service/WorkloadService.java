
package com.cloudscale.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cloudscale.backend.entity.Workload;
import com.cloudscale.backend.exception.ResourceNotFoundException;
import com.cloudscale.backend.repository.WorkloadRepository;

@Service
public class WorkloadService {

    private final WorkloadRepository repository;

    public WorkloadService(WorkloadRepository repository) {
        this.repository = repository;
    }

    // CREATE
    public Workload createWorkload(Workload workload) {
        return repository.save(workload);
    }

    // READ ALL
    public List<Workload> getAllWorkloads() {
        return repository.findAll();
    }

    // READ BY ID
    public Workload getWorkloadById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Workload not found with ID: " + id));
    }

    // UPDATE
    public Workload updateWorkload(Long id, Workload updatedWorkload) {

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

    // DELETE
    public void deleteWorkload(Long id) {
        Workload existingWorkload = getWorkloadById(id);
        repository.delete(existingWorkload);
    }
}
