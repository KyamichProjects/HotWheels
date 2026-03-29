import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { enforceRateLimit } from "@/lib/rate-limit";

const SUSPICIOUS_USER_AGENT_PATTERNS = [
  "sqlmap",
  "nikto",
  "acunetix",
  "masscan",
  "zgrab",
  "nessus",
  "nmap",
  "python-requests",
  "aiohttp",
  "go-http-client",
  "wget/",
  "libwww-perl"
];

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cloudflareIp = request.headers.get("cf-connecting-ip");

  if (cloudflareIp) {
    return cloudflareIp;
  }

  if (realIp) {
    return realIp;
  }

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

function isSuspiciousUserAgent(userAgent: string) {
  const normalized = userAgent.toLowerCase();
  return SUSPICIOUS_USER_AGENT_PATTERNS.some((pattern) =>
    normalized.includes(pattern)
  );
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

function getRateLimitConfig(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname.startsWith("/api/telegram/")) {
    return { limit: 120, windowSeconds: 60, scope: "telegram-webhook" };
  }

  if (pathname.startsWith("/api/auth/")) {
    return { limit: 15, windowSeconds: 600, scope: "auth" };
  }

  if (pathname.startsWith("/api/")) {
    if (method === "POST" || method === "PATCH" || method === "PUT" || method === "DELETE") {
      return { limit: 40, windowSeconds: 60, scope: "api-write" };
    }

    return { limit: 180, windowSeconds: 60, scope: "api-read" };
  }

  return { limit: 240, windowSeconds: 60, scope: "site" };
}

function buildRateLimitResponse(request: NextRequest, resetAt: number) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const response = isApi
    ? NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    : new NextResponse("Too many requests. Please try again later.", {
        status: 429
      });

  response.headers.set("Retry-After", String(Math.max(Math.ceil((resetAt - Date.now()) / 1000), 1)));
  return applySecurityHeaders(response);
}

function buildBlockedResponse(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/");
  const response = isApi
    ? NextResponse.json({ error: "Request blocked." }, { status: 403 })
    : new NextResponse("Request blocked.", { status: 403 });

  return applySecurityHeaders(response);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method.toUpperCase();
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "";
  const isApi = pathname.startsWith("/api/");
  const isTelegramWebhook = pathname.startsWith("/api/telegram/");

  if (
    isApi &&
    !isTelegramWebhook &&
    method !== "GET" &&
    userAgent &&
    isSuspiciousUserAgent(userAgent)
  ) {
    return buildBlockedResponse(request);
  }

  const rateLimitConfig = getRateLimitConfig(request);
  const rateLimitKey = `${rateLimitConfig.scope}:${ip}:${method}`;
  const rateLimit = await enforceRateLimit(
    rateLimitKey,
    rateLimitConfig.limit,
    rateLimitConfig.windowSeconds
  );

  if (!rateLimit.success) {
    return buildRateLimitResponse(request, rateLimit.resetAt);
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(rateLimitConfig.limit));
  response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
  response.headers.set("X-RateLimit-Reset", String(rateLimit.resetAt));

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|uploads).*)"
  ]
};
