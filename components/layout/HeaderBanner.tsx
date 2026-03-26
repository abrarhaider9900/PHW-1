"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function HeaderBanner() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setIsAuthenticated(true);
            }
        });
    }, [supabase]);

    return (
        <div
            style={{
                maxWidth: "1200px",   // controls container width
                margin: "10px auto",  // center + top spacing
                padding: "0 20px",    // side spacing
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "420px",
                    overflow: "hidden",
                    borderRadius: "20px",   // rounded corners
                }}
            >
                <Image
                    src="/images/header-banner.png"
                    alt="Header Banner"
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                />

                {/* Overlay */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.25)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        padding: "20px",
                    }}
                >
                    <h1
                        style={{
                            color: "#ffffff",
                            fontSize: "48px",
                            fontWeight: "900",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            marginBottom: "24px",
                            textShadow: "2px 4px 15px rgba(0,0,0,0.6)",
                        }}
                    >
                        SPONSOR AD
                    </h1>

                    <NextLink
                        href="/login"
                        className="relative overflow-hidden 
                        font-[700] text-[14px] uppercase px-8 py-3
                        text-white
                        group"
                    >
                        <span className="relative z-10 text-white">Start to view</span>

                        {/* Left Half */}
                        <span className="absolute top-0 left-0 w-1/2 h-full 
                        bg-green-700
                        transition-transform duration-400 ease-in-out
                        group-hover:-translate-x-full" />

                        {/* Right Half */}
                        <span className="absolute top-0 right-0 w-1/2 h-full 
                        bg-green-700
                        transition-transform duration-400 ease-in-out
                        group-hover:translate-x-full" />
                    </NextLink>
                </div>
            </div>
        </div>
    );
}
