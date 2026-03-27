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
            className="container"
            style={{
                margin: "10px auto",  // center + top spacing
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: "20px",   // rounded corners
                }}
                className="h-[200px] sm:h-[280px] md:h-[350px]"
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
                            fontWeight: "900",
                            letterSpacing: "2px",
                            textTransform: "uppercase",
                            marginBottom: "16px",
                            textShadow: "2px 4px 15px rgba(0,0,0,0.6)",
                        }}
                        className="text-[24px] sm:text-[36px] md:text-[48px]"
                    >
                        SPONSOR AD
                    </h1>

                    <NextLink
                        href="/login"
                        className="relative overflow-hidden 
                        font-[700] text-[12px] md:text-[14px] uppercase px-6 md:px-8 py-2 md:py-3
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
