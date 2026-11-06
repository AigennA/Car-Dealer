"use client";

import { useState } from "react";
import { authenticate, register, ACCOUNT_MESSAGES, DEMO_ACCOUNT } from "@/lib/admin/accounts";
import { signIn } from "@/lib/admin/session";
import { SUBMIT_CLASS } from "@/components/forms/FormKit";

const INPUT = "w-full border border-gray-400 rounded-lg px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-gray-900";
const LABEL = "block text-sm font-medium text-gray-700 mb-1";

/** Demo staff login / registration (browser-only). */
export default function LoginPanel() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const registering = mode === "register";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = registering ? register(username, password) : authenticate(username, password);
    if (!result.ok) return setError(result.error);
    setError("");
    if (registering) {
      setNotice(ACCOUNT_MESSAGES.created);
      setMode("login");
    } else {
      signIn(result.username);
    }
  };

  const toggleMode = () => {
    setMode(registering ? "login" : "register");
    setError("");
    setNotice("");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-sm p-8 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-navy mb-6 text-center">{registering ? "Skapa konto" : "Admin Login"}</h1>

        {notice && !registering && (
          <p role="status" className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-green-800 text-sm text-center">{notice}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className={LABEL}>Användarnamn</label>
            <input id="username" type="text" autoComplete="username" value={username} className={INPUT}
              aria-describedby={error ? "login-error" : undefined}
              onChange={(e) => { setUsername(e.target.value); setError(""); }} />
          </div>
          <div>
            <label htmlFor="password" className={LABEL}>Lösenord</label>
            <input id="password" type="password" autoComplete={registering ? "new-password" : "current-password"} value={password}
              className={INPUT} aria-describedby={error ? "login-error" : undefined}
              onChange={(e) => { setPassword(e.target.value); setError(""); }} />
          </div>
          {error && <p id="login-error" role="alert" className="text-red-700 text-sm">{error}</p>}
          <button type="submit" className={SUBMIT_CLASS}>{registering ? "Skapa konto" : "Logga in"}</button>
        </form>

        <div className="mt-4 text-center">
          <button type="button" onClick={toggleMode} className="text-sm text-primary underline-offset-4 hover:underline">
            {registering ? "Har du redan ett konto? Logga in" : "Skapa nytt konto"}
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-4 text-center">
          Demo: användarnamn &quot;{DEMO_ACCOUNT.username}&quot;, lösenord &quot;{DEMO_ACCOUNT.password}&quot;
        </p>
      </div>
    </div>
  );
}
