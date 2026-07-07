// backend/src/utils/validator.mjs
export function validateOrderData(data) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{8}$/; // HK 8-digit format

    if (!data.name || data.name.trim().length < 2) errors.push("Valid name is required.");
    if (!data.email || !emailRegex.test(data.email)) errors.push("Invalid email format.");
    if (!data.phone || !phoneRegex.test(data.phone)) errors.push("Phone number must be 8 digits.");
    if (!data.address || data.address.trim().length < 5) errors.push("Full address is required.");
    if (!['PayMe', 'AlipayHK', 'WeChatCode', 'FPS'].includes(data.payment_method)) {
        errors.push("Invalid payment method selected.");
    }

    return errors;
}