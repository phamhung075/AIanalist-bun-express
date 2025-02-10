// src/utils/phone-formatter.ts
export function formatPhoneToE164(phoneNumber: string): string {
	// Remove all non-digit characters
	let digitsOnly = phoneNumber.replace(/\D/g, '');

	// Handle French phone numbers
	if (digitsOnly.startsWith('0')) {
		// Replace leading 0 with 33 for French numbers
		digitsOnly = '33' + digitsOnly.substring(1);
	}

	// If number starts with 33 but no +, add it
	if (digitsOnly.startsWith('33')) {
		return '+' + digitsOnly;
	}

	// If number doesn't start with 33, assume it's a French number
	if (!digitsOnly.startsWith('33')) {
		digitsOnly = '33' + digitsOnly;
	}

	// Add + prefix if not present
	return digitsOnly.startsWith('+') ? digitsOnly : '+' + digitsOnly;
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
	// Basic E.164 validation
	const e164Regex = /^\+[1-9]\d{1,14}$/;
	return e164Regex.test(phoneNumber);
}
