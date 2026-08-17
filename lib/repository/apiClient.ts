/**
 * A typed error thrown by every repository function on a failed request —
 * either the network itself failed, or the server responded with a
 * non-2xx status. Carries the HTTP status (when we have one) and whatever
 * error message the API sent back, so callers (store actions) can show a
 * meaningful message rather than a generic "something went wrong."
 */
export class ApiError extends Error {
  status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Shared fetch wrapper for every repository function. Handles:
 * - Network failures (fetch itself throwing — e.g. offline) -> ApiError
 * - Non-2xx responses -> ApiError, using the API's own { error } message
 *   when present (our route handlers always return that shape on failure)
 * - 204 No Content (DELETE routes) -> resolves to undefined, since there's
 *   no body to parse
 *
 * T is the shape of the successful response body, so every call site gets
 * a typed result without repeating `as SomeType` everywhere.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("Network request failed — check your connection.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // Response body wasn't JSON (or was empty) — fall through to the generic message.
  }
  return `Request failed with status ${response.status}`;
}
