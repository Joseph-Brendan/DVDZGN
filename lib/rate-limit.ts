/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach per key (IP or email).
 * 
 * NOTE: This works per-instance. In a multi-instance deployment (e.g., serverless),
 * consider using Redis-based rate limiting instead. For Vercel serverless functions,
 * this still provides meaningful protection per cold-start instance.
 */

interface RateLimitEntry {
    timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        entry.timestamps = entry.timestamps.filter(t => now - t < 600_000) // 10 min
        if (entry.timestamps.length === 0) {
            rateLimitStore.delete(key)
        }
    }
}, 300_000)

/**
 * Check if a request should be rate-limited.
 * @param key - Unique identifier (e.g., IP address, email)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request should be BLOCKED, false if allowed
 */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = rateLimitStore.get(key) || { timestamps: [] }

    // Remove timestamps outside the window
    entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

    if (entry.timestamps.length >= maxRequests) {
        rateLimitStore.set(key, entry)
        return true // BLOCKED
    }

    entry.timestamps.push(now)
    rateLimitStore.set(key, entry)
    return false // ALLOWED
}

/**
 * Extract client IP from request headers.
 * Supports Vercel, Cloudflare, and standard proxied requests.
 */
export function getClientIp(req: Request): string {
    return (
        req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        req.headers.get("x-real-ip") ||
        req.headers.get("cf-connecting-ip") ||
        "unknown"
    )
}
