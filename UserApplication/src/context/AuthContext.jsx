import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const decodeEmailFromToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || null;
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('member_token'));
  const [role, setRole] = useState(localStorage.getItem('member_role'));
  const [email, setEmail] = useState(() => {
    const storedEmail = localStorage.getItem('member_email');
    if (storedEmail) return storedEmail;
    
    // Fallback: decode email from existing token if possible
    const existingToken = localStorage.getItem('member_token');
    const decoded = decodeEmailFromToken(existingToken);
    if (decoded) {
      localStorage.setItem('member_email', decoded);
    }
    return decoded;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = (newToken, newRole, newEmail) => {
    localStorage.setItem('member_token', newToken);
    localStorage.setItem('member_role', newRole);
    
    const emailToSet = newEmail || decodeEmailFromToken(newToken);
    if (emailToSet) {
      localStorage.setItem('member_email', emailToSet);
      setEmail(emailToSet);
    }
    
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem('member_token');
    localStorage.removeItem('member_role');
    localStorage.removeItem('member_email');
    setToken(null);
    setRole(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, email, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
