/**
 * Password validation utilities
 */

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  specialChars: string;
}

export const defaultPasswordRequirements: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:\'"<>,.?/',
};

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
}

/**
 * Validate password against requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = defaultPasswordRequirements
): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;
  
  // Check minimum length
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`);
  } else {
    score += 1;
    // Bonus points for extra length
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
  }
  
  // Check uppercase
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (/[A-Z]/.test(password)) {
    score += 1;
  }
  
  // Check lowercase
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (/[a-z]/.test(password)) {
    score += 1;
  }
  
  // Check numbers
  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (/\d/.test(password)) {
    score += 1;
  }
  
  // Check special characters
  const specialCharRegex = new RegExp(`[${requirements.specialChars.replace(/[\\\]]/g, '\\$&')}]`);
  if (requirements.requireSpecialChars && !specialCharRegex.test(password)) {
    errors.push('Password must contain at least one special character');
  } else if (specialCharRegex.test(password)) {
    score += 1;
  }
  
  // Check for common patterns
  if (hasCommonPatterns(password)) {
    errors.push('Password contains common patterns or sequences');
    score -= 1;
  }
  
  // Calculate strength
  let strength: PasswordValidationResult['strength'];
  if (score < 3) {
    strength = 'weak';
  } else if (score < 5) {
    strength = 'medium';
  } else if (score < 7) {
    strength = 'strong';
  } else {
    strength = 'very-strong';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.max(0, score),
  };
}

/**
 * Check for common patterns
 */
function hasCommonPatterns(password: string): boolean {
  const patterns = [
    /12345/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
  ];
  
  // Check for sequences
  const hasSequence = /abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password);
  const hasNumberSequence = /012|123|234|345|456|567|678|789|890/.test(password);
  
  return patterns.some(pattern => pattern.test(password)) || hasSequence || hasNumberSequence;
}

/**
 * Generate password strength message
 */
export function getPasswordStrengthMessage(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'weak':
      return 'Weak password. Consider making it longer and more complex.';
    case 'medium':
      return 'Medium strength. Add more variety for better security.';
    case 'strong':
      return 'Strong password. Good job!';
    case 'very-strong':
      return 'Very strong password. Excellent!';
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each required type
  let password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Shuffle
  return password.sort(() => Math.random() - 0.5).join('');
}