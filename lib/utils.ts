import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extract the domain portion from an email address (e.g. user@example.com -> example.com)
export function getEmailDomain(email: string): string | null {
  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) return null

  const domain = email.slice(atIndex + 1).toLowerCase().trim()
  return domain || null
}

// Small, focused set of common disposable email providers we want to reject at signup
const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'trashmail.com',
  'yopmail.com',
])

export function isDisposableEmailDomain(domain: string): boolean {
  const normalized = domain.toLowerCase()

  if (DISPOSABLE_EMAIL_DOMAINS.has(normalized)) {
    return true
  }

  // Also catch basic subdomain patterns like anything.mailinator.com
  for (const disposable of DISPOSABLE_EMAIL_DOMAINS) {
    if (normalized.endsWith(`.${disposable}`)) {
      return true
    }
  }

  return false
}

// "Strict-ish" format check for emails, used in addition to Zod's built-in .email()
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmailFormat(email: string): boolean {
  if (!EMAIL_REGEX.test(email)) {
    return false
  }

  const domain = getEmailDomain(email)
  if (!domain) return false

  // Basic domain sanity checks
  if (!domain.includes('.')) return false
  if (domain.startsWith('-') || domain.startsWith('.')) return false
  if (domain.endsWith('-') || domain.endsWith('.')) return false

  const parts = domain.split('.')
  const tld = parts[parts.length - 1]
  if (tld.length < 2 || tld.length > 24) return false

  return true
}

// Combined helper used in signup validation: ensures format is OK and domain is not disposable
export function isAllowedSignupEmail(email: string): boolean {
  if (!isValidEmailFormat(email)) {
    return false
  }

  const domain = getEmailDomain(email)
  if (!domain) {
    return false
  }

  if (isDisposableEmailDomain(domain)) {
    return false
  }

  return true
}
