
package com.cloudscale.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudscale.backend.entity.Workload;

@Repository
public interface WorkloadRepository
        extends JpaRepository<Workload, Long> {

}
