package com.fooderp.backend.feature;

import com.fooderp.backend.auth.dto.ApproveMitraRequest;
import com.fooderp.backend.auth.dto.CreateStaffRequest;
import com.fooderp.backend.auth.dto.LoginRequest;
import com.fooderp.backend.auth.dto.RegisterMitraRequest;
import com.fooderp.backend.auth.entity.UserRole;
import com.fooderp.backend.auth.repository.AppUserRepository;
import com.fooderp.backend.masterdata.entity.Customer;
import com.fooderp.backend.masterdata.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Feature: Multi-Role Authentication & Mitra Onboarding Lifecycle")
public class AuthAndRbacFeatureTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private Customer sampleCustomer;

    @BeforeEach
    void setUp() {
        sampleCustomer = customerRepository.findAll().stream().findFirst().orElse(null);
    }

    @Nested
    @DisplayName("Given seeded user accounts")
    class AuthenticationScenarios {

        @Test
        @DisplayName("Scenario 1: Superadmin login succeeds and issues valid JWT token")
        void testSuperadminLoginSuccess() throws Exception {
            LoginRequest request = new LoginRequest("admin", "admin123");

            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token", notNullValue()))
                    .andExpect(jsonPath("$.tokenType", is("Bearer")))
                    .andExpect(jsonPath("$.user.username", is("admin")))
                    .andExpect(jsonPath("$.user.role", is("SUPERADMIN")))
                    .andExpect(jsonPath("$.user.status", is("ACTIVE")));
        }

        @Test
        @DisplayName("Scenario 2: Mitra self-registration requires Superadmin approval before login")
        void testMitraSelfRegistrationAndApprovalLifecycle() throws Exception {
            // 1. Mitra registers
            String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
            RegisterMitraRequest regRequest = new RegisterMitraRequest(
                    "mitra." + uniqueSuffix,
                    "mitra." + uniqueSuffix + "@franchise.id",
                    "password123",
                    "Franchise Owner " + uniqueSuffix,
                    "+62 812-9999-001",
                    UserRole.MITRA_OUTLET,
                    "Bistro Senopati " + uniqueSuffix,
                    "Requesting outlet partner access for Central Kitchen commissary"
            );

            MvcResult regResult = mockMvc.perform(post("/api/auth/register-mitra")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(regRequest)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username", is(regRequest.username())))
                    .andExpect(jsonPath("$.status", is("PENDING_APPROVAL")))
                    .andExpect(jsonPath("$.role", is("MITRA_OUTLET")))
                    .andExpect(jsonPath("$.partnerType", is("OUTLET")))
                    .andReturn();

            Map<?, ?> createdUser = objectMapper.readValue(regResult.getResponse().getContentAsString(), Map.class);
            UUID mitraId = UUID.fromString((String) createdUser.get("id"));

            // 2. Attempt login while still pending approval -> Expect rejection
            LoginRequest unapprovedLogin = new LoginRequest(regRequest.username(), "password123");
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(unapprovedLogin)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message", containsString("Pending Approval")));

            // 3. Superadmin logs in to acquire token
            MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest("admin", "admin123"))))
                    .andExpect(status().isOk())
                    .andReturn();

            Map<?, ?> adminLogin = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), Map.class);
            String adminToken = (String) adminLogin.get("token");

            // 4. Superadmin approves Mitra and links to Customer outlet
            ApproveMitraRequest approveReq = new ApproveMitraRequest(
                    "APPROVE",
                    sampleCustomer != null ? sampleCustomer.getId() : null,
                    null,
                    "Verified franchise legal documents and billing address"
            );

            mockMvc.perform(patch("/api/users/" + mitraId + "/approve")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(approveReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status", is("ACTIVE")))
                    .andExpect(jsonPath("$.approvedBy", notNullValue()));

            // 5. Approved Mitra logs in successfully
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest(regRequest.username(), "password123"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token", notNullValue()))
                    .andExpect(jsonPath("$.user.role", is("MITRA_OUTLET")))
                    .andExpect(jsonPath("$.user.status", is("ACTIVE")));
        }

        @Test
        @DisplayName("Scenario 3: Superadmin creates internal staff account")
        void testSuperadminCreateStaff() throws Exception {
            // Admin logs in
            MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest("admin", "admin123"))))
                    .andExpect(status().isOk())
                    .andReturn();

            Map<?, ?> adminLogin = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), Map.class);
            String adminToken = (String) adminLogin.get("token");

            // Create Staff
            String suffix = UUID.randomUUID().toString().substring(0, 8);
            CreateStaffRequest staffReq = new CreateStaffRequest(
                    "staff." + suffix,
                    "staff." + suffix + "@fooderp.com",
                    "staffpass123",
                    "Kitchen Supervisor " + suffix,
                    "+62 811-2222-333",
                    UserRole.KITCHEN_MANAGER
            );

            mockMvc.perform(post("/api/users/staff")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(staffReq)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.username", is(staffReq.username())))
                    .andExpect(jsonPath("$.role", is("KITCHEN_MANAGER")))
                    .andExpect(jsonPath("$.status", is("ACTIVE")));

            // Staff logs in directly
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(new LoginRequest(staffReq.username(), "staffpass123"))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token", notNullValue()))
                    .andExpect(jsonPath("$.user.role", is("KITCHEN_MANAGER")));
        }
    }
}
