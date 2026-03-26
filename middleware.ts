import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 🛡️ Guard: Ensure environment variables are present
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("Middleware Error: Missing Supabase environment variables.");
        return response; // Fail gracefully or redirect to a maintenance page
    }

    try {
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        });

        const {
            data: { user },
        } = await supabase.auth.getUser();

        const pathname = request.nextUrl.pathname;

        // Protected routes
        const protectedPaths = ["/admin", "/dashboard", "/profile", "/following", "/discover"];

        if (protectedPaths.some((p) => pathname.startsWith(p))) {
            if (!user) {
                const url = request.nextUrl.clone();
                url.pathname = "/login";
                url.searchParams.set("redirectedFrom", pathname);
                return NextResponse.redirect(url);
            }
        }

        // Auth routes: redirect away from login/register if already logged in
        if (pathname === "/login" || pathname === "/register") {
            if (user) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }

        return response;
    } catch (error) {
        console.error("Middleware crash caught:", error);
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};