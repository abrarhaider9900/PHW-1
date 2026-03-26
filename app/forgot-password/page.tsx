"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
        } else {
            setSubmitted(true);
        }
        setLoading(false);
    };

    return (
        <div style={{ minHeight: "calc(100vh - 140px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ width: "100%", maxWidth: "380px" }}>
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                        Forgot Password
                    </h1>
                    <p style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                        Back to{" "}
                        <Link href="/register" style={{ color: "var(--color-primary)" }}>Sign Up</Link>
                        {" "}or{" "}
                        <Link href="/login" style={{ color: "var(--color-primary)" }}>Login</Link>
                    </p>
                </div>

                <div className="card" style={{ padding: "28px" }}>
                    {submitted ? (
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "32px", marginBottom: "12px" }}>📧</div>
                            <p style={{ color: "var(--color-text)", fontSize: "14px", marginBottom: "8px" }}>
                                Reset link sent!
                            </p>
                            <p style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                                Check your email for a password reset link.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {error && (
                                <div style={{
                                    background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                                    color: "#f87171", padding: "10px 14px", borderRadius: "3px", fontSize: "13px",
                                }}>
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="form-label">Email Address</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="form-input" placeholder="your@email.com" required />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}
                                style={{ width: "100%", padding: "12px", fontSize: "14px", opacity: loading ? 0.7 : 1 }}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>

                <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "16px" }}>
                    <Link href="/register" style={{ fontSize: "13px", color: "var(--color-primary)" }}>Click to Sign Up</Link>
                    <Link href="/login" style={{ fontSize: "13px", color: "var(--color-primary)" }}>Click to Login</Link>
                </div>
            </div>
        </div>
    );
}
