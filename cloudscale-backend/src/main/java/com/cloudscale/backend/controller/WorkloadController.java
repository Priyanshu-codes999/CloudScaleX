
package com.cloudscale.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.cloudscale.backend.entity.Workload;
import com.cloudscale.backend.service.WorkloadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/workloads")
public class WorkloadController {

    private final WorkloadService service;

    public WorkloadController(WorkloadService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public Workload createWorkload(
            @Valid @RequestBody Workload workload) {
        return service.createWorkload(workload);
    }

    // READ ALL
    @GetMapping
    public List<Workload> getAllWorkloads() {
        return service.getAllWorkloads();
    }

    // READ BY ID
    @GetMapping("/{id}")
    public Workload getWorkloadById(@PathVariable Long id) {
        return service.getWorkloadById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Workload updateWorkload(
            @PathVariable Long id,
            @Valid @RequestBody Workload workload) {
        return service.updateWorkload(id, workload);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteWorkload(@PathVariable Long id) {
        service.deleteWorkload(id);
        return "Workload deleted successfully with ID: " + id;
    }
}
