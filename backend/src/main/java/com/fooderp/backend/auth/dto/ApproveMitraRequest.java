package com.fooderp.backend.auth.dto;

import java.util.UUID;

public record ApproveMitraRequest(
    String action, // 'APPROVE' or 'REJECT'
    UUID customerId, // If linking to existing Customer
    UUID supplierId, // If linking to existing Supplier
    String approvalNotes
) {}
