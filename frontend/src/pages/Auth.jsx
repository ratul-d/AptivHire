// src/pages/Auth.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, clearTokens } from "../services/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const navigate = useNavigate();

  // ensure tokens cleared when showing auth page
  React.useEffect(() => {
    clearTokens();
  }, []);

  // simple email validation
  const isValidEmail = (value) => {
    if (!value) return false;
    const v = value.trim();
    // basic RFC-like check (sufficient for common use)
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const handleEmailChange = (val) => {
    setEmail(val);
    setError(null);
    setMessage(null);

    const trimmed = (val || "").trim();
    if (trimmed.length === 0) {
      setEmailError(null);
    } else if (!isValidEmail(trimmed)) {
      setEmailError("Enter a valid email address (this will be your username).");
    } else {
      setEmailError(null);
    }
  };

  const onLogin = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return setError("Fill both fields");
    if (!isValidEmail(trimmedEmail)) return setError("Username must be a valid email address");
    setLoading(true);
    try {
      await login({ email: trimmedEmail, password });
      setMessage("Login successful — redirecting...");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async () => {
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password || !confirm) return setError("Fill all fields");
    if (!isValidEmail(trimmedEmail)) return setError("Username must be a valid email address");
    if (password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await register({ email: trimmedEmail, password });
      setMessage("Registration successful — please login");
      setIsLogin(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div style={{ width: 480, background: "#fff", borderRadius: 10, padding: 28, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ fontSize: 28, fontWeight: 750 }} onClick={() => navigate('/')}>AptivHire</div>
        </header>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button
            onClick={() => { setIsLogin(true); setMessage(null); setError(null); }}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              background: isLogin ? "#111" : "#fafafa",
              color: isLogin ? "#fff" : "#333",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Login
          </button>
          <button
            onClick={() => { setIsLogin(false); setMessage(null); setError(null); }}
            style={{
              flex: 1,
              padding: 10,
              border: "none",
              background: !isLogin ? "#111" : "#fafafa",
              color: !isLogin ? "#fff" : "#333",
              borderRadius: 8,
              cursor: "pointer"
            }}
          >
            Register
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Username (email)</label>
          <input
            value={email}
            onChange={e => handleEmailChange(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #eee" }}
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!emailError}
            aria-describedby="email-help"
          />
          {emailError && <div id="email-help" style={{ color: "#ea4335", marginTop: 6 }}>{emailError}</div>}
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #eee" }} type="password" />
        </div>

        {!isLogin && (
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Confirm Password</label>
            <input value={confirm} onChange={e => setConfirm(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #eee" }} type="password" />
          </div>
        )}

        {error && <div style={{ color: "#ea4335", marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: "#0f9d58", marginBottom: 12 }}>{message}</div>}

        <div>
          {isLogin ? (
            <button
              onClick={onLogin}
              style={{ width: "100%", padding: 12, borderRadius: 8, background: "#111", color: "#fff", border: "none", cursor: "pointer" }}
              disabled={loading}
            >
              {loading ? "Logging in…" : "Login"}
            </button>
          ) : (
            <button
              onClick={onRegister}
              style={{ width: "100%", padding: 12, borderRadius: 8, background: "#111", color: "#fff", border: "none", cursor: "pointer" }}
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
