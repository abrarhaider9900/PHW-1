"use client";

import Image from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, ChevronDown, User, X } from "lucide-react";
import type { Profile } from "@/types/database";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
    const avatarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getProfile = async (userId: string) => {
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();
            setProfile(data);
        };

        // Initial check
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setEmail(user.email ?? null);
                getProfile(user.id);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setEmail(session.user.email ?? null);
                getProfile(session.user.id);
            } else {
                setEmail(null);
                setProfile(null);
            }
        });

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
                setAvatarDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setEmail(null);
        router.push("/");
        router.refresh();
    };

    interface SubLink {
        label: string;
        href: string;
        onClick?: () => void;
    }

    interface NavLink {
        label: string;
        href: string;
        onClick?: () => void;
        dropdown?: SubLink[];
    }

    const navLinks: NavLink[] = [
        { label: "HOME", href: "/" },
        {
            label: "SEARCH",
            href: "/allhorses",
            dropdown: [
                { label: "Horses", href: "/allhorses" },
                { label: "Riders", href: "/riders" },
                { label: "Owners", href: "/owners" },
                { label: "Trainers", href: "/trainers" },
                { label: "Events", href: "/allevents" },
                { label: "Sale Listings", href: "/sale-listings" },
            ]
        },
        { label: "FOLLOWING", href: "/following" },
        { label: "DISCOVER", href: "/discover" },
        ...(email ? [{
            label: "ACCOUNT",
            href: "/account/owned-horses",
            dropdown: [
                { label: "Owned Horses", href: "/account/owned-horses" },
                { label: "Trained Horses", href: "/account/trained-horses" },
                { label: "Rider Performances", href: "/account/rider-performances" },
                { label: "Producer Events", href: "/account/producer-events" },
                { label: "Listings", href: "/account/listings" },
                { label: "Add Performance", href: "/account/add-performance" },
                { label: "Settings", href: "/settings" },
            ]
        }] : []),
    ];

    return (
        <header className="w-full bg-[#f1f1f1] sticky top-0 z-50">
            <div className="max-w-[1240px] mx-auto px-6 md:px-10">
                <nav className="flex items-center justify-between h-[80px] md:h-[130px]">

                    {/* Logo */}
                    <NextLink href="/" className="flex items-center">
                        <Image
                            src="/images/logo.png"
                            alt="logo"
                            width={100}
                            height={50}
                            className="w-[80px] md:w-[120px] h-auto"
                            priority
                        />
                    </NextLink>

                    {/* Center Navigation - Hidden on Mobile */}
                    <ul className="hidden md:flex items-center gap-[25px] lg:gap-[35px] uppercase text-[13px] lg:text-[14px] font-[700] tracking-[0.5px]">
                        {navLinks.map((link) => (
                            <li
                                key={link.label}
                                className="relative h-[130px] flex items-center group"
                            >
                                <NextLink
                                    href={link.href}
                                    onClick={(e) => {
                                        if (link.onClick) {
                                            e.preventDefault();
                                            link.onClick();
                                        }
                                    }}
                                    className={`flex items-center gap-1 transition-colors duration-200 ${pathname === link.href
                                        ? "text-[var(--color-primary)]"
                                        : "text-[#141414] hover:text-[var(--color-primary)]"
                                        }`}
                                >
                                    {link.label}
                                    {link.dropdown && (
                                        <ChevronDown size={14} strokeWidth={3} />
                                    )}
                                </NextLink>

                                {/* Dropdown */}
                                {link.dropdown && (
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full 
                                                    opacity-0 translate-y-3 pointer-events-none
                                                    group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
                                                    transition-all duration-300 ease-out">

                                        <div className="bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] 
                                                    w-[280px] lg:w-[320px] py-6 lg:py-8 relative">

                                            {link.dropdown.map((sub) => (
                                                <NextLink
                                                    key={sub.label}
                                                    href={sub.href}
                                                    onClick={(e) => {
                                                        if (sub.onClick) {
                                                            e.preventDefault();
                                                            sub.onClick();
                                                        }
                                                    }}
                                                    className="block px-8 lg:px-10 py-2.5 lg:py-3 text-[14px] lg:text-[15px] font-[600] text-[#444] hover:text-[var(--color-primary)]"
                                                >
                                                    {sub.label}
                                                </NextLink>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Right Section */}
                    <div className="flex items-center gap-[15px] md:gap-[25px]">
                        {!email ? (
                            <NextLink
                                href="/login"
                                className="relative overflow-hidden 
                                            font-[700] text-[12px] md:text-[14px] uppercase px-4 md:px-8 py-2 md:py-3
                                            text-white
                                            group hidden sm:block"
                            >
                                <span className="relative z-10 text-white">Login/Signup</span>

                                {/* Left Half */}
                                <span className="absolute top-0 left-0 w-1/2 h-full 
                                                bg-[var(--color-primary)]
                                                transition-transform duration-400 ease-in-out
                                                group-hover:-translate-x-full" />

                                {/* Right Half */}
                                <span className="absolute top-0 right-0 w-1/2 h-full 
                                                bg-[var(--color-primary)]
                                                transition-transform duration-400 ease-in-out
                                                group-hover:translate-x-full" />
                            </NextLink>
                        ) : (
                            <div className="relative" ref={avatarRef}>
                                <div
                                    className="flex items-center gap-2 md:gap-4 cursor-pointer"
                                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                                >
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[14px] md:text-[16px] font-[700] text-[#333] leading-tight lowercase">
                                            {profile?.full_name || email.split('@')[0]}
                                        </div>
                                    </div>
                                    <div className="w-[35px] h-[35px] md:w-[45px] md:h-[45px] bg-[#d1d5db] rounded-full flex items-center justify-center text-white overflow-hidden relative">
                                        {profile?.avatar_url ? (
                                            <Image
                                                src={profile.avatar_url}
                                                alt="avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User size={24} fill="currentColor" strokeWidth={0} />
                                        )}
                                    </div>
                                </div>

                                {/* Avatar Dropdown */}
                                {avatarDropdownOpen && (
                                    <div className="absolute right-0 top-[calc(100%+15px)] w-[200px] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] rounded-lg py-4 z-[100]">
                                        {/* Arrow */}
                                        <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45" />

                                        <div className="relative bg-white">
                                            {[
                                                { label: "Dashboard", href: "/dashboard" },
                                                { label: "Profile", href: "/profile" },
                                                { label: "Inbox", href: "/inbox" },
                                                { label: "Settings", href: "/settings" },
                                                { label: "Help", href: "/help" },
                                            ].map((item) => (
                                                <NextLink
                                                    key={item.label}
                                                    href={item.href}
                                                    className="block px-6 py-2.5 text-[15px] font-[500] text-[#444] hover:bg-gray-50 hover:text-[var(--color-primary)] transition-colors"
                                                    onClick={() => setAvatarDropdownOpen(false)}
                                                >
                                                    {item.label}
                                                </NextLink>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    setAvatarDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-6 py-2.5 text-[15px] font-[500] text-[#444] hover:bg-gray-50 hover:text-red-600 transition-colors border-t border-gray-100 mt-2"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className={`flex items-center justify-center transition-all duration-300 ${searchOpen ? 'text-[#00a884]' : 'text-[#141414]'}`}
                            onClick={() => setSearchOpen(!searchOpen)}
                        >
                            {searchOpen ? (
                                <X size={28} strokeWidth={2.5} />
                            ) : (
                                <Search size={28} strokeWidth={2.5} />
                            )}
                        </button>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden text-2xl text-[#141414]"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? <X size={28} /> : "☰"}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 z-[100] bg-white">
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b">
                            <Image
                                src="/images/logo.png"
                                alt="logo"
                                width={100}
                                height={50}
                            />
                            <button onClick={() => setMobileOpen(false)} className="text-2xl">
                                <X size={32} />
                            </button>
                        </div>
                        <ul className="flex-1 overflow-y-auto py-6">
                            {navLinks.map((link) => (
                                <li key={link.label} className="border-b last:border-none">
                                    <div className="px-6 py-4">
                                        <NextLink
                                            href={link.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="text-[18px] font-[700] text-[#141414] block"
                                        >
                                            {link.label}
                                        </NextLink>
                                        {link.dropdown && (
                                            <ul className="mt-2 ml-4">
                                                {link.dropdown.map((sub) => (
                                                    <li key={sub.label} className="py-2">
                                                        <NextLink
                                                            href={sub.href}
                                                            onClick={() => setMobileOpen(false)}
                                                            className="text-[15px] font-[600] text-[#666]"
                                                        >
                                                            {sub.label}
                                                        </NextLink>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </li>
                            ))}
                            {!email && (
                                <li className="px-6 py-6">
                                    <NextLink
                                        href="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="w-full bg-[var(--color-primary)] text-white text-center py-4 rounded-lg font-bold block"
                                    >
                                        LOGIN / SIGNUP
                                    </NextLink>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* Floating Search Bar Popup */}
            {searchOpen && (
                <div className="absolute top-[80px] md:top-[130px] left-0 right-0 md:right-10 px-4 md:px-0 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-full px-6 md:px-10 py-3 md:py-5 flex items-center gap-4 w-full md:w-[450px] mx-auto md:ml-auto md:mr-0">
                        <input
                            type="text"
                            placeholder="Search"
                            className="flex-1 bg-transparent border-none outline-none text-[16px] md:text-[18px] font-[500] text-[#333]"
                            autoFocus
                        />
                        <button className="text-[#333] hover:text-[var(--color-primary)] transition-colors">
                            <Search size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
