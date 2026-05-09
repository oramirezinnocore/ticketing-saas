/**
 * JWT Utility Functions
 *
 * Provides safe, defensive JWT handling with no runtime errors.
 * All functions gracefully handle invalid inputs.
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat?: number;
}

/**
 * Validates JWT structure without decoding
 * @param token - Token string to validate
 * @returns true if token has valid JWT structure (3 parts separated by dots)
 */
export const isValidJWT = (token: unknown): token is string => {
  // Check token exists and is a string
  if (!token || typeof token !== 'string') {
    return false;
  }

  // Check token is not empty or whitespace only
  if (token.trim().length === 0) {
    return false;
  }

  // Check JWT structure (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Check each part is not empty
  if (parts.some((part) => !part || part.trim().length === 0)) {
    return false;
  }

  return true;
};

/**
 * Safely decodes JWT payload without verification
 * Note: Verification happens on backend. This is only for client-side checks.
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: unknown): JWTPayload | null => {
  try {
    // Validate token structure first
    if (!isValidJWT(token)) {
      console.debug('[JWT] Invalid token structure');
      return null;
    }

    // Extract payload (second part)
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.debug('[JWT] Missing payload section');
      return null;
    }

    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode base64 to JSON string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // Parse JSON
    const payload = JSON.parse(jsonPayload);

    // Validate required fields
    if (!payload || typeof payload !== 'object') {
      console.debug('[JWT] Invalid payload structure');
      return null;
    }

    if (!payload.userId || !payload.email || !payload.role) {
      console.debug('[JWT] Missing required fields in payload');
      return null;
    }

    return payload as JWTPayload;
  } catch (error) {
    // Catch any unexpected errors (atob, JSON.parse, etc.)
    console.debug('[JWT] Decode error:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

/**
 * Checks if JWT token is expired
 *
 * @param token - JWT token string
 * @returns true if token is expired or invalid
 */
export const isTokenExpired = (token: unknown): boolean => {
  // Invalid tokens are considered expired
  if (!isValidJWT(token)) {
    return true;
  }

  const payload = decodeJWT(token);

  // Missing payload or exp field means invalid/expired
  if (!payload || !payload.exp) {
    return true;
  }

  // Check expiration (exp is in seconds, Date.now() is in milliseconds)
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return expirationTime < currentTime;
};

/**
 * Gets time until token expiration in seconds
 * @param token - JWT token string
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export const getTokenExpirationTime = (token: unknown): number => {
  if (!isValidJWT(token)) {
    return 0;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const timeRemaining = Math.max(0, Math.floor((expirationTime - currentTime) / 1000));

  return timeRemaining;
};

/**
 * Extracts user role from JWT token
 * @param token - JWT token string
 * @returns User role or null if invalid
 */
export const getTokenRole = (token: unknown): string | null => {
  if (!isValidJWT(token)) {
    return null;
  }

  const payload = decodeJWT(token);
  return payload?.role || null;
};
