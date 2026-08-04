export async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
  try {
    const response = await fetch(url);

    if (response.ok) {
      return response;
    } else {
      const retryableStatuses = new Set([425, 429, 500, 502, 503, 504]);
      if (retries > 0 && retryableStatuses.has(response.status)) {
        console.warn(
          `Status ${response.status}. Retrying in ${delay}ms... (${retries} left)`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, retries - 1, delay * 2); // Exponential backoff
      }

      return response;
    }
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Network error. Retrying in ${delay}ms... (${retries} left)`,
        error,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, retries - 1, delay * 2);
    }
    throw error;
  }
}
