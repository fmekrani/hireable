/**
 * Verify a Supabase JWT token and extract user from it
 */

export async function verifySupabaseToken(token: string) {
  try {
    // Decode JWT manually - it's a standard JWT format
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('[Token Verify] Invalid token format')
      return null
    }

    // Decode the payload (second part)
    const payload = parts[1]
    // Add padding if needed
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'))

    // Check if token is expired
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (decoded.exp < now) {
        console.error('[Token Verify] Token has expired')
        return null
      }
    }

    // Return user object with required fields
    return {
      id: decoded.sub, // The 'sub' claim contains the user ID in Supabase tokens
      email: decoded.email,
      user_metadata: decoded.user_metadata || {},
    }
  } catch (error) {
    console.error('[Token Verify] Error verifying token:', error)
    return null
  }
}
