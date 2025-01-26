import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import chalk from "chalk";

export { default } from "next-auth/middleware";

export async function middleware(request: NextRequest) {
    const url = request.nextUrl; // Get the current URL
    const method = request.method;
    // eslint-disable-next-line no-console
    console.log(chalk.green(`${Date.now()} ${method} ${url.pathname}`));

    const token = await getToken({ req: request }); // Extract token

    const protectedPaths = ["/home", "/projects", "/tasks", "/calendar", "/feedback", "/settings"];
    const isProtectedRoute = protectedPaths.some((path) => url.pathname.startsWith(path));
    const isAuthPage = ["/", "/sign-in", "/sign-up"].includes(url.pathname);

    if (token) {
        // Authenticated user
        if (isAuthPage) {
            // Prevent authenticated users from accessing sign-in or sign-up
            return NextResponse.redirect(new URL("/home", request.url));
        }
        // Allow access to protected routes
        return NextResponse.next();
    } else {
        // Unauthenticated user
        if (isProtectedRoute) {
            // Redirect unauthenticated users trying to access protected routes
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
        // Allow access to public pages (e.g., sign-in, sign-up, or landing page)
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/",
        "/sign-in",
        "/sign-up",
        "/home",
        "/projects",
        "/tasks",
        "/calendar",
        "/feedback",
        "/settings"
    ],
};
