/**
 * Verify a Supabase JWT token by calling the Supabase auth endpoint
 * This is the most reliable way to verify tokens on the server side
 */
export async function verifySupabaseToken(token: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Token Verify] Missing Supabase credentials');
      return null;
    }

    // Call the Supabase auth endpoint to verify the token
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseServiceKey,
      },
    });

    if (!response.ok) {
      console.error('[Token Verify] Token verification failed with status:', response.status);
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('[Token Verify] Error verifying token:', error);
    return null;
  }
}
