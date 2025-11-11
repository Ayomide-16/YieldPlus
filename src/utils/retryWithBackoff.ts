/**
 * Utility function to retry async operations with exponential backoff
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds
 * @returns The result of the function or throws the last error
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

/**
 * Check if an error is retryable (network errors, 5xx errors, rate limits)
 */
export function isRetryableError(error: any): boolean {
  if (error?.status === 429 || error?.status === 402) {
    return false; // Don't retry payment or rate limit errors
  }
  
  if (error?.status >= 500 && error?.status < 600) {
    return true; // Retry server errors
  }
  
  if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
    return true; // Retry network errors
  }
  
  return false;
}
