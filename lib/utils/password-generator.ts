/**
 * Password Generator Utility
 * 
 * Generates strong, secure passwords that meet common requirements:
 * - At least 8 characters (default 16)
 * - Contains uppercase letters
 * - Contains lowercase letters
 * - Contains numbers
 * - Contains special characters
 */

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
const NUMBERS = "0123456789"
const SPECIAL = "!@#$%^&*(),.?\":{}|<>"

/**
 * Generates a strong password
 * @param length - Desired password length (default: 16, minimum: 8)
 * @returns A randomly generated strong password
 */
export function generateStrongPassword(length: number = 16): string {
  // Ensure minimum length of 8
  const passwordLength = Math.max(8, length)
  
  // Ensure we have at least one character from each required set
  let password = ""
  password += UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]
  password += LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]
  password += NUMBERS[Math.floor(Math.random() * NUMBERS.length)]
  password += SPECIAL[Math.floor(Math.random() * SPECIAL.length)]
  
  // Fill the rest with random characters from all sets
  const allChars = UPPERCASE + LOWERCASE + NUMBERS + SPECIAL
  for (let i = password.length; i < passwordLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password to avoid predictable patterns
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

