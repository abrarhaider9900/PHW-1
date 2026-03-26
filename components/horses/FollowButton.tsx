"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
    horseId: number;
    initialIsFollowing?: boolean;
}

export default function FollowButton({ horseId, initialIsFollowing = false }: FollowButtonProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);

            if (user) {
                const { data } = await (supabase
                    .from("horse_follows")
                    .select("*")
                    .eq("horse_id", horseId)
                    .eq("user_id", user.id)
                    .single() as any);
                setIsFollowing(!!data);
            }
        };
        checkAuth();
    }, [horseId, supabase]);

    const handleFollow = async () => {
        if (!userId) {
            router.push("/login");
            return;
        }

        setLoading(true);

        if (isFollowing) {
            await supabase
                .from("horse_follows")
                .delete()
                .eq("horse_id", horseId)
                .eq("user_id", userId);
            setIsFollowing(false);
        } else {
            await (supabase
                .from("horse_follows") as any)
                .insert({ horse_id: horseId, user_id: userId });
            setIsFollowing(true);
        }

        setLoading(false);
        router.refresh();
    };

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={isFollowing ? "btn-outline" : "btn-primary"}
            style={{
                padding: "6px 16px",
                fontSize: "12px",
                fontWeight: 600,
                minWidth: "100px",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px"
            }}
        >
            <span>{isFollowing ? "❤️ FOLLOWING" : "🤍 FOLLOW"}</span>
        </button>
    );
}
