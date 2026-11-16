
package com.cloudscale.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "workloads")
public class Workload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Application name is required")
    @Column(nullable = false)
    private String applicationName;

    @Min(value = 1, message = "CPU cores must be at least 1")
    private int cpuCores;

    @Min(value = 1, message = "RAM must be at least 1 GB")
    private int ramGb;

    @Min(value = 0, message = "Expected users cannot be negative")
    private int expectedUsers;

    @DecimalMin(value = "0.0", message = "Budget cannot be negative")
    private double monthlyBudget;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Default constructor
    public Workload() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public String getApplicationName() {
        return applicationName;
    }

    public void setApplicationName(String applicationName) {
        this.applicationName = applicationName;
    }

    public int getCpuCores() {
        return cpuCores;
    }

    public void setCpuCores(int cpuCores) {
        this.cpuCores = cpuCores;
    }

    public int getRamGb() {
        return ramGb;
    }

    public void setRamGb(int ramGb) {
        this.ramGb = ramGb;
    }

    public int getExpectedUsers() {
        return expectedUsers;
    }

    public void setExpectedUsers(int expectedUsers) {
        this.expectedUsers = expectedUsers;
    }

    public double getMonthlyBudget() {
        return monthlyBudget;
    }

    public void setMonthlyBudget(double monthlyBudget) {
        this.monthlyBudget = monthlyBudget;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
