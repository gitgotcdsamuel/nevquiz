import { prisma } from './prisma';

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  reset?: number;
}

export async function rateLimit(
  identifier: string,
  maxAttempts: number = 60,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    const record = await prisma.rateLimit.findUnique({
      where: { identifier },
    });

    if (!record) {
      // Create new record
      await prisma.rateLimit.create({
        data: {
          identifier,
          attempts: 1,
          resetAt,
        },
      });
      return { success: true, remaining: maxAttempts - 1, reset: resetAt.getTime() };
    }

    // Check if window has expired
    if (now > record.resetAt) {
      // Reset the counter
      await prisma.rateLimit.update({
        where: { identifier },
        data: {
          attempts: 1,
          resetAt,
        },
      });
      return { success: true, remaining: maxAttempts - 1, reset: resetAt.getTime() };
    }

    // Check if limit exceeded
    if (record.attempts >= maxAttempts) {
      return {
        success: false,
        remaining: 0,
        reset: record.resetAt.getTime(),
      };
    }

    // Increment attempts
    await prisma.rateLimit.update({
      where: { identifier },
      data: {
        attempts: record.attempts + 1,
      },
    });

    return {
      success: true,
      remaining: maxAttempts - (record.attempts + 1),
      reset: record.resetAt.getTime(),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // In case of error, allow the request
    return { success: true };
  }
}

// Helper function to get IP address
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}
