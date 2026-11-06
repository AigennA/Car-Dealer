/**
 * Base URL of the dealer platform API (backend/). Set NEXT_PUBLIC_API_URL at
 * build time, e.g. https://cardealer-api.azurewebsites.net. Without it the
 * website runs in demo mode: everything works in the browser, nothing is sent.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
export const apiEnabled = API_URL !== "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

/** fetch wrapper that turns ASP.NET Core ProblemDetails into ApiError. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const body = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const problem = (body ?? {}) as { title?: string; detail?: string; errors?: Record<string, string[]> };
    throw new ApiError(res.status, problem.detail ?? problem.title ?? "Något gick fel. Försök igen.", problem.errors ?? {});
  }
  return body as T;
}
