import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows basic formatting tags
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  })
}

/**
 * Sanitize HTML content with more permissive settings for rich text editors
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'figure', 'figcaption',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'width', 'height'],
  })
}

/**
 * Remove all HTML tags from a string
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] })
}

/**
 * Sanitize user input by removing potentially dangerous characters
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '').trim()
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char])
}

/**
 * Validate and sanitize a bid amount
 */
export function validateBidAmount(amount: string): { valid: boolean; value: number; error?: string } {
  const trimmed = amount.trim().replace(/,/g, '')

  if (!trimmed) {
    return { valid: false, value: 0, error: 'Amount is required' }
  }

  const num = Number(trimmed)

  if (isNaN(num)) {
    return { valid: false, value: 0, error: 'Invalid number format' }
  }

  if (num < 0) {
    return { valid: false, value: 0, error: 'Amount must be positive' }
  }

  if (num > 999999999) {
    return { valid: false, value: 0, error: 'Amount exceeds maximum limit' }
  }

  return { valid: true, value: num }
}

/**
 * Validate an email address
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = email.trim()

  if (!trimmed) {
    return { valid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' }
  }

  return { valid: true }
}

/**
 * Validate a phone number (basic validation)
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  const trimmed = phone.trim().replace(/[\s\-\(\)]/g, '')

  if (!trimmed) {
    return { valid: true } // Phone might be optional
  }

  if (!/^\+?[\d]{6,15}$/.test(trimmed)) {
    return { valid: false, error: 'Invalid phone number format' }
  }

  return { valid: true }
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.href
  } catch {
    return null
  }
}
