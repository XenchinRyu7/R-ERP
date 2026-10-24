package com.fooderp.backend.auth.service;

import com.fooderp.backend.auth.dto.*;
import com.fooderp.backend.auth.entity.AppUser;
import com.fooderp.backend.auth.entity.UserRole;
import com.fooderp.backend.auth.entity.UserStatus;
import com.fooderp.backend.auth.repository.AppUserRepository;
import com.fooderp.backend.auth.security.JwtTokenProvider;
import com.fooderp.backend.masterdata.entity.Customer;
import com.fooderp.backend.masterdata.entity.Supplier;
import com.fooderp.backend.masterdata.entity.Warehouse;
import com.fooderp.backend.masterdata.repository.CustomerRepository;
import com.fooderp.backend.masterdata.repository.SupplierRepository;
import com.fooderp.backend.masterdata.repository.WarehouseRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private final AppUserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(
            AppUserRepository userRepository,
            CustomerRepository customerRepository,
            SupplierRepository supplierRepository,
            WarehouseRepository warehouseRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        String identifier = request.usernameOrEmail().trim();
        AppUser user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (user.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Akun mitra Anda sedang menunggu persetujuan Superadmin (Pending Approval)");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new RuntimeException("Pendaftaran akun mitra Anda telah ditolak. Silakan hubungi admin");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new RuntimeException("Akun Anda telah dinonaktifkan oleh administrator");
        }

        String token = tokenProvider.generateToken(user);
        return new LoginResponse(token, toDto(user));
    }

    public UserDto registerMitra(RegisterMitraRequest request) {
        if (userRepository.findByUsername(request.username().trim()).isPresent()) {
            throw new RuntimeException("Username '" + request.username() + "' already taken");
        }
        if (userRepository.findByEmail(request.email().trim().toLowerCase()).isPresent()) {
            throw new RuntimeException("Email '" + request.email() + "' already registered");
        }

        if (request.role() != UserRole.MITRA_OUTLET && request.role() != UserRole.SUPPLIER_VENDOR) {
            throw new RuntimeException("Mitra registration only allows MITRA_OUTLET or SUPPLIER_VENDOR roles");
        }

        String partnerType = request.role() == UserRole.MITRA_OUTLET ? "OUTLET" : "VENDOR";

        AppUser user = new AppUser(
                UUID.randomUUID(),
                request.username().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.role(),
                request.phone(),
                UserStatus.PENDING_APPROVAL,
                partnerType,
                request.partnerName().trim()
        );

        if (request.notes() != null && !request.notes().isBlank()) {
            user.setApprovalNotes("Registration notes: " + request.notes());
        }

        AppUser saved = userRepository.save(user);
        return toDto(saved);
    }

    public UserDto createStaff(CreateStaffRequest request) {
        if (userRepository.findByUsername(request.username().trim()).isPresent()) {
            throw new RuntimeException("Username '" + request.username() + "' already taken");
        }
        if (userRepository.findByEmail(request.email().trim().toLowerCase()).isPresent()) {
            throw new RuntimeException("Email '" + request.email() + "' already registered");
        }

        AppUser user = new AppUser(
                UUID.randomUUID(),
                request.username().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                request.role(),
                request.phone(),
                UserStatus.ACTIVE,
                null,
                null
        );

        if (request.warehouseId() != null) {
            Warehouse warehouse = warehouseRepository.findById(request.warehouseId()).orElse(null);
            user.setWarehouse(warehouse);
        }

        AppUser saved = userRepository.save(user);
        return toDto(saved);
    }

    public UserDto approveMitra(UUID userId, ApproveMitraRequest request, String approverUsername) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        boolean isApprove = "APPROVE".equalsIgnoreCase(request.action());

        if (isApprove) {
            user.setStatus(UserStatus.ACTIVE);
            if (request.customerId() != null) {
                Customer customer = customerRepository.findById(request.customerId()).orElse(null);
                user.setCustomer(customer);
            }
            if (request.supplierId() != null) {
                Supplier supplier = supplierRepository.findById(request.supplierId()).orElse(null);
                user.setSupplier(supplier);
            }
        } else {
            user.setStatus(UserStatus.REJECTED);
        }

        user.setApprovedBy(approverUsername != null ? approverUsername : "Superadmin");
        user.setApprovedAt(LocalDateTime.now());
        if (request.approvalNotes() != null) {
            user.setApprovalNotes(request.approvalNotes());
        }

        return toDto(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(UUID id) {
        return userRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public UserDto getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public UserDto updateUserStatus(UUID id, UserStatus newStatus) {
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setStatus(newStatus);
        return toDto(userRepository.save(user));
    }

    public UserDto toDto(AppUser user) {
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getPhone(),
                user.getStatus(),
                user.getPartnerType(),
                user.getPartnerName(),
                user.getCustomer() != null ? user.getCustomer().getId() : null,
                user.getCustomer() != null ? user.getCustomer().getName() : null,
                user.getSupplier() != null ? user.getSupplier().getId() : null,
                user.getSupplier() != null ? user.getSupplier().getName() : null,
                user.getWarehouse() != null ? user.getWarehouse().getId() : null,
                user.getWarehouse() != null ? user.getWarehouse().getName() : null,
                user.getWarehouse() != null ? user.getWarehouse().getCode() : null,
                user.getApprovalNotes(),
                user.getApprovedBy(),
                user.getApprovedAt(),
                user.getCreatedAt()
        );
    }
}
