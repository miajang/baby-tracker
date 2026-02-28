import { useState } from "react";

const BRAND = "#237a82";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email && password.length >= 6;

  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#fafafa", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", maxWidth: 400, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: "none", stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
              <path d="M9 12l-1.5 7H6.5a2 2 0 0 1 0-4h11a2 2 0 0 1 0 4h-1l-1.5-7" />
              <circle cx="12" cy="7" r="4.5" />
            </svg>
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: BRAND, marginBottom: 2 }}>BabyTracker</div>
          <div style={{ fontSize: ".82rem", color: "#666", marginBottom: 0 }}>Every Milestone Matters</div>
        </div>

        <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Email</div>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={function (e) { setEmail(e.target.value); }}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: ".92rem", marginBottom: 16, outline: "none", boxSizing: "border-box" }}
        />

        <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Password</div>
        <input
          type="password"
          placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #ddd", borderRadius: 8, fontSize: ".92rem", marginBottom: 24, outline: "none", boxSizing: "border-box" }}
        />

        <button
          onClick={function () { if (onLogin) onLogin(); }}
          disabled={!canSubmit}
          style={{ width: "100%", background: canSubmit ? BRAND : "#ccc", color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: ".95rem", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", transition: "background .15s" }}
        >
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span
            onClick={function () { setMode(mode === "login" ? "signup" : "login"); }}
            style={{ fontSize: ".82rem", color: BRAND, cursor: "pointer", fontWeight: 600 }}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </span>
        </div>
      </div>
    </div>
  );
}
