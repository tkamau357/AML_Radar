export interface ApiResponse<T> {
  id: string;
  message: string;
  result: T;
  timestamp: string;
}

export function extractResult<T>(response: ApiResponse<T>): T {
  return response.result;
}
