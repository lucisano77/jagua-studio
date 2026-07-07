// backend/test/utils/validator.mjs
import { describe, it, expect } from 'vitest';
import { validateOrderData } from '../../src/utils/validator.mjs'; // Correct relative path

describe('Anna\'s Studio Order Validation Suite', () => {
    
    it('should pass with flawless Hong Kong order data', () => {
        const validPayload = {
            name: "Anna Lee",
            email: "anna@jaguastudio.com",
            phone: "91234567",
            address: "Flat B, 10/F, Nathan Road, Mong Kok",
            payment_method: "PayMe",
            total_amount: 150.00
        };

        const errors = validateOrderData(validPayload);
        expect(errors.length).toBe(0);
    });

    it('should flag fields that fail business validation logic', () => {
        const invalidPayload = {
            name: " ",                      // Empty string spaces
            email: "missing-at-sign.com",   // Broken regex match
            phone: "9123456",               // Only 7 digits
            address: "HK",                  // Too brief
            payment_method: "Visa",         // Missing QR/FPS methods
            total_amount: 200.00
        };

        const errors = validateOrderData(invalidPayload);
        
        expect(errors).toContain("Valid name is required.");
        expect(errors).toContain("Invalid email format.");
        expect(errors).toContain("Phone number must be 8 digits.");
        expect(errors).toContain("Full address is required.");
        expect(errors).toContain("Invalid payment method selected.");
        expect(errors.length).toBe(5);
    });
});