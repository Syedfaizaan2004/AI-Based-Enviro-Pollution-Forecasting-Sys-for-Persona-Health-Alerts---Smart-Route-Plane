export function getApiErrorMessage(error: any, fallback: string): string {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item?.msg || String(item)).join(', ');
  }
  if (typeof detail === 'string') {
    return detail;
  }
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
}
