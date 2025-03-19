import { auth } from "firebase-admin"; // Import the Firebase Admin SDK's `auth` module to handle authentication.
import { NextRequest, NextResponse } from "next/server"; // Import Next.js middleware utilities for handling requests and responses.

// Initialize Firebase Admin if not already initialized
if (!auth.apps.length) { // Check if Firebase Admin has already been initialized to avoid reinitialization errors.
  auth.initializeApp({
    credential: auth.applicationDefault(), // Use the default credentials (e.g., from GOOGLE_APPLICATION_CREDENTIALS env variable).
    // Alternatively, you can use `auth.cert()` with a service account key for more control.
  });
}

// Define route access map (similar to Clerk's `routeAccessMap`)
const routeAccessMap: Record<string, string[]> = { // A mapping of routes to the roles allowed to access them.
  "/admin": ["admin"], // Only users with the "admin" role can access routes starting with "/admin".
  "/teacher": ["teacher"], // Only users with the "teacher" role can access routes starting with "/teacher".
  "/student": ["student"], // Only users with the "student" role can access routes starting with "/student".
};

export async function middleware(req: NextRequest) { // Middleware function to handle incoming requests.
  const token = req.headers.get("Authorization")?.split("Bearer ")[1]; // Extract the Firebase ID token from the "Authorization" header.

  if (!token) { // If no token is provided, redirect the user to the login page.
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect to the login page.
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await auth().verifyIdToken(token); // Verify the token using Firebase Admin SDK and decode its contents.
    const userRole = decodedToken.role; // Extract the user's role from the token's custom claims (assuming `role` is set).

    // Check if the user has access to the requested route
    for (const [route, allowedRoles] of Object.entries(routeAccessMap)) { // Iterate through the route access map.
      if (req.nextUrl.pathname.startsWith(route) && !allowedRoles.includes(userRole)) { 
        // If the requested route matches a restricted route and the user's role is not allowed:
        return NextResponse.redirect(new URL(`/${userRole}`, req.url)); // Redirect the user to their role-specific page.
      }
    }

    return NextResponse.next(); // If the user is authorized, allow the request to proceed.
  } catch (error) { // Handle errors during token verification.
    console.error("Authentication Error:", error); // Log the error for debugging purposes.
    return NextResponse.redirect(new URL("/login", req.url)); // Redirect to the login page if verification fails.
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // This matcher ensures the middleware is not applied to static files or Next.js internal routes.
    // Always run for API routes
    "/(api|trpc)(.*)", // Apply the middleware to all API routes and `trpc` routes.
  ],
};