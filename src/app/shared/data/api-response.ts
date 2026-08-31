/**
 * Standard API response wrapper matching backend ApiResponse<T>
 */
export interface ApiResponse<T> {
  id: string;
  message: string;
  result: T;
  timestamp: string;
}

/**
 * Helper to extract result from ApiResponse
 */
export function extractResult<T>(response: ApiResponse<T>): T {
  return response.result;
}
