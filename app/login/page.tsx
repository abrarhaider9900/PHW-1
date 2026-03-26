"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Lock } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            const { data: profile } = await (supabase.from("profiles") as any)
                .select("role")
                .eq("id", data.user.id)
                .single();

            if (profile?.role === "admin") {
                router.push("/dashboard");
            } else {
                router.push("/dashboard");
            }
            router.refresh();
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            backgroundImage: `linear-gradient(rgba(235, 87, 87, 0.4), rgba(45, 156, 219, 0.4)), url('/images/auth-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000
        }}>
            <div style={{ width: "100%", maxWidth: "440px", zIndex: 1001 }}>
                <div className="card" style={{ padding: "40px", borderRadius: "12px", background: "#fff", border: "none" }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#333", marginBottom: "8px" }}>
                            Please Log In, or Sign Up
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {error && (
                            <div style={{
                                background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
                                color: "#f87171", padding: "10px 14px", borderRadius: "4px", fontSize: "13px",
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                                display: "flex", alignItems: "center", color: "#666"
                            }}>
                                <User size={18} />
                                <div style={{ height: "20px", width: "1px", background: "#ddd", marginLeft: "10px" }}></div>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 14px 14px 50px", borderRadius: "4px",
                                    border: "none", background: "#f0f0f0", fontSize: "15px", color: "#333"
                                }}
                                placeholder="Email"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                                display: "flex", alignItems: "center", color: "#666"
                            }}>
                                <Lock size={18} />
                                <div style={{ height: "20px", width: "1px", background: "#ddd", marginLeft: "10px" }}></div>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 14px 14px 50px", borderRadius: "4px",
                                    border: "none", background: "#f0f0f0", fontSize: "15px", color: "#333"
                                }}
                                placeholder="Password"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#666", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{ cursor: "pointer" }}
                                />
                                Remember Me
                            </label>
                            <Link href="/forgot-password" style={{ fontSize: "13px", color: "#666" }}>
                                Forgot your password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700",
                                background: "#e7a431", color: "#fff", border: "none", borderRadius: "4px",
                                cursor: "pointer", textTransform: "uppercase", transition: "background 0.3s"
                            }}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "LOGIN"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/register')}
                            style={{
                                width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700",
                                background: "#e79321", color: "#fff", border: "none", borderRadius: "4px",
                                cursor: "pointer", textTransform: "uppercase", transition: "background 0.3s"
                            }}
                        >
                            CLICK TO SIGN UP
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
