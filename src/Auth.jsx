import { useState } from "react";
import { supabase } from "./supabaseClient.js";

const BRAND = "#CC5B80";
const BTN = "#d8809e";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const saved = function () { try { var v = localStorage.getItem("bt-login"); return v ? JSON.parse(v) : null; } catch(e) { return null; } }();
  const [email, setEmail] = useState(saved ? saved.email : "");
  const [password, setPassword] = useState(saved ? saved.password : "");
  const [remember, setRemember] = useState(!!saved);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email && password.length >= 6 && !loading;

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (!supabase) { setError("Database not configured"); setLoading(false); return; }
      var res;
      if (mode === "signup") {
        res = await supabase.auth.signUp({ email: email, password: password });
      } else {
        res = await supabase.auth.signInWithPassword({ email: email, password: password });
      }
      if (res.error) {
        setError(res.error.message);
      } else {
        if (remember) {
          localStorage.setItem("bt-login", JSON.stringify({ email: email, password: password }));
        } else {
          localStorage.removeItem("bt-login");
        }
        if (onLogin) onLogin(res.data.session);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
    setLoading(false);
  }

  return (
      <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: "#fff", borderRadius: 16, padding: "36px 32px", maxWidth: 400, width: "100%", boxShadow: "0 4px 20px rgba(0,0,0,.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#CC5B80", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <svg viewBox="0 0 24 24" style={{ width: 26, height: 26, fill: "none", stroke: "#fff", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }}>
              <g transform="translate(0,1.5)">
                <path d="M9 12l-1.5 7H6.5a2 2 0 0 1 0-4h11a2 2 0 0 1 0 4h-1l-1.5-7" />
                <circle cx="12" cy="7" r="4.5" />
              </g>
            </svg>
          </div>
          <div style={{ fontSize: "1.5rem", marginBottom: 2 }}><span style={{ fontWeight: 550, color: "#CC5B80" }}>Baby</span><span style={{ fontWeight: 350, color: "#CC5B80" }}>Tracker</span></div>
          <div style={{ fontSize: ".82rem", color: "#999", marginBottom: 0, letterSpacing: ".02em" }}>Every Milestone Matters</div>
        </div>

        {error && <div style={{ background: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: ".82rem", marginBottom: 16 }}>{error}</div>}

        <form onSubmit={function(e){ e.preventDefault(); if(canSubmit) handleSubmit(); }}>
        <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Email</div>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={function (e) { setEmail(e.target.value); }}
          onKeyDown={function (e) { if (e.key === "Enter" && canSubmit) handleSubmit(); }}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: ".92rem", marginBottom: 16, outline: "none", boxSizing: "border-box" }}
        />

        <div style={{ fontSize: ".78rem", fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>Password</div>
        <input
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
          value={password}
          onChange={function (e) { setPassword(e.target.value); }}
          onKeyDown={function (e) { if (e.key === "Enter" && canSubmit) handleSubmit(); }}
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 8, fontSize: ".92rem", marginBottom: 16, outline: "none", boxSizing: "border-box" }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, cursor: "pointer", fontSize: ".84rem", color: "#666" }}>
          <span onClick={function () { setRemember(!remember); }} style={{ width: 18, height: 18, borderRadius: 4, border: remember ? "none" : "1px solid #ccc", background: remember ? BTN : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>{remember && <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, fill: "none", stroke: "#fff", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }}><polyline points="20 6 9 17 4 12"/></svg>}</span>
          Save login info
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          style={{ width: "100%", background: BTN, color: "#fff", border: "none", padding: "12px", borderRadius: 8, fontSize: ".95rem", fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed", opacity: canSubmit ? 1 : 0.65, transition: "opacity .15s" }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span
            onClick={function () { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ fontSize: ".82rem", color: BRAND, cursor: "pointer", fontWeight: 600 }}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </span>
        </div>
      </div>
  );
}
