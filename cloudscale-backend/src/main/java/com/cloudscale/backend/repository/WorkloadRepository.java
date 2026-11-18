
package com.cloudscale.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cloudscale.backend.entity.Workload;

@Repository
public interface WorkloadRepository extends JpaRepository<Workload, Long> {

    List<Workload> findAllByOwner_Id(Long ownerId);

    Optional<Workload> findByIdAndOwner_Id(Long id, Long ownerId);
}
