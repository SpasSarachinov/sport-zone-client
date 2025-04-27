export const decodeJWT = (token: string | null) => {
  if (!token) {
    console.log('No token provided');
    return null;
  }
  
  try {
    // Split the token and verify structure
    const parts = token.split('.');
    console.log('Token parts length:', parts.length);
    
    if (parts.length !== 3) {
      console.error('Invalid JWT format - should have 3 parts');
      return null;
    }

    const [header, payload, signature] = parts;
    console.log('Header:', header);
    console.log('Raw payload:', payload);

    // Decode the payload
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const rawPayload = atob(base64);
    
    // Convert to JSON
    const decodedPayload = JSON.parse(rawPayload);
    console.log('Decoded payload:', decodedPayload);
    
    // Log specific claims we're interested in
    console.log('Role claim:', decodedPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    console.log('Name claim:', decodedPayload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]);
    
    return decodedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    console.error('Token that caused error:', token);
    return null;
  }
}; 