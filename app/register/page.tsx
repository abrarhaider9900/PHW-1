"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Mail, Lock, Phone } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const supabase = createClient();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { 
                    full_name: fullName,
                    phone: phone 
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            // Create profile record
            await (supabase.from("profiles") as any).insert({
                id: data.user.id,
                full_name: fullName,
                email: email,
                phone: phone,
                role: "user",
            });

            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        }

        setLoading(false);
    };

    if (success) {
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
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1000
            }}>
                <div style={{ width: "100%", maxWidth: "440px", zIndex: 1001 }}>
                    <div className="card" style={{ padding: "40px", borderRadius: "12px", background: "#fff", border: "none", textAlign: "center" }}>
                        <div style={{ fontSize: "40px", marginBottom: "16px" }}>✅</div>
                        <h2 style={{ color: "#333", fontSize: "18px", marginBottom: "8px", fontWeight: 700 }}>Registration Successful!</h2>
                        <p style={{ color: "#666", fontSize: "13px" }}>Redirecting to login...</p>
                    </div>
                </div>
            </div>
        );
    }

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
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 1000
        }}>
            <div style={{ width: "100%", maxWidth: "440px", zIndex: 1001 }}>
                <div className="card" style={{ padding: "40px", borderRadius: "12px", background: "#fff", border: "none" }}>
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#333", marginBottom: "8px" }}>
                            Please Sign Up, or Log In
                        </h1>
                    </div>

                    <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 14px 14px 50px", borderRadius: "4px",
                                    border: "none", background: "#f0f0f0", fontSize: "15px", color: "#333"
                                }}
                                placeholder="Full Name"
                                required
                            />
                        </div>

                        <div style={{ position: "relative" }}>
                            <div style={{
                                position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
                                display: "flex", alignItems: "center", color: "#666"
                            }}>
                                <Mail size={18} />
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
                                <Phone size={18} />
                                <div style={{ height: "20px", width: "1px", background: "#ddd", marginLeft: "10px" }}></div>
                            </div>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 14px 14px 50px", borderRadius: "4px",
                                    border: "none", background: "#f0f0f0", fontSize: "15px", color: "#333"
                                }}
                                placeholder="Phone Number"
                                required
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
                                autoComplete="new-password"
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
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: "100%", padding: "14px 14px 14px 50px", borderRadius: "4px",
                                    border: "none", background: "#f0f0f0", fontSize: "15px", color: "#333"
                                }}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700",
                                background: "#e7a431", color: "#fff", border: "none", borderRadius: "4px",
                                cursor: "pointer", textTransform: "uppercase", transition: "background 0.3s",
                                marginTop: "10px"
                            }}
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "SIGN UP"}
                        </button>

                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            style={{
                                width: "100%", padding: "14px", fontSize: "15px", fontWeight: "700",
                                background: "#e79321", color: "#fff", border: "none", borderRadius: "4px",
                                cursor: "pointer", textTransform: "uppercase", transition: "background 0.3s"
                            }}
                        >
                            CLICK TO LOGIN
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
