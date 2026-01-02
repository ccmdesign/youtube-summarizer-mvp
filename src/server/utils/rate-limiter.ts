/**
 * Token bucket rate limiter
 * Ensures we don't exceed API rate limits
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number, // tokens per second
    private refillInterval: number = 1000 // milliseconds
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  /**
   * Wait until a token is available, then consume it
   */
  async acquire(): Promise<void> {
    this.refill();

    while (this.tokens < 1) {
      const waitTime = this.refillInterval;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.refill();
    }

    this.tokens -= 1;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / 1000) * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Get current token count
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }
}

// Gemini Flash rate limiter: 60 requests per minute
export const geminiFlashLimiter = new RateLimiter(60, 1); // 1 token/second = 60/minute

// Gemini Pro rate limiter: 10 requests per minute
export const geminiProLimiter = new RateLimiter(10, 0.167); // ~10/minute

// YouTube API rate limiter (conservative: 10 requests per second)
export const youtubeApiLimiter = new RateLimiter(100, 10);
