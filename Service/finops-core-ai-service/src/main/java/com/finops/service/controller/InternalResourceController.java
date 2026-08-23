package com.finops.service.controller;

import com.finops.service.dto.InternalCloudResourceDto;
import com.finops.service.entity.CloudResource;
import com.finops.service.repository.CloudResourceRepository;
import io.swagger.v3.oas.annotations.Hidden;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@Hidden
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/internal/resources")
public class InternalResourceController {

    private final CloudResourceRepository cloudResourceRepository;

    @GetMapping("/active")
    public List<InternalCloudResourceDto> getActiveResources() {
        return cloudResourceRepository.findByStatusIgnoreCase("ACTIVE").stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{resourceId}")
    public InternalCloudResourceDto getResource(@PathVariable String resourceId) {
        return cloudResourceRepository.findById(resourceId)
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found: " + resourceId));
    }

    @GetMapping("/{resourceId}/active")
    public InternalCloudResourceDto getActiveResource(@PathVariable String resourceId) {
        return cloudResourceRepository.findByIdAndStatus(resourceId, "ACTIVE")
                .map(this::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active resource not found: " + resourceId));
    }

    private InternalCloudResourceDto toDto(CloudResource resource) {
        return new InternalCloudResourceDto(
                resource.getId(),
                resource.getTenant().getId(),
                resource.getResourceName(),
                resource.getResourceType(),
                resource.getInstanceType(),
                resource.getHourlyCost(),
                resource.getStatus()
        );
    }
}
