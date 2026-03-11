export function formatAlertBody(body: string): string {
  if (!body) {
    return "";
  }

  return body
    .replace(/\s*(ENG\s*[:：])/gi, "\n$1")
    .replace(/\s*(BM\s*[:：])/gi, "\n$1")
    .replace(/\s*(中文\s*[:：])/g, "\n$1")
    .trim();
}
