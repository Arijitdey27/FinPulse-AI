package com.finops.service.repository;

import com.finops.service.entity.AppUser;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppUserRepository extends JpaRepository<AppUser, String> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<AppUser> findByIdAndTenant_Id(String id, String tenantId);

    long countByTenant_Id(String tenantId);

    long countByTenant_IdAndRoleIgnoreCase(String tenantId, String role);

    Page<AppUser> findByTenant_Id(String tenantId, Pageable pageable);

    @Query("""
            select u from AppUser u
            where u.tenant.id = :tenantId
              and (
                lower(u.name) like concat('%', :search, '%')
                or lower(u.email) like concat('%', :search, '%')
                or lower(u.role) like concat('%', :search, '%')
                or lower(coalesce(u.description, '')) like concat('%', :search, '%')
              )
            """)
    Page<AppUser> searchTenantUsers(@Param("tenantId") String tenantId,
                                    @Param("search") String search,
                                    Pageable pageable);
}
