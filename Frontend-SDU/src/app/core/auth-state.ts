let authorizationHeader: string | null = null;

export function createAuthorizationHeader(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return `Basic ${btoa(binary)}`;
}

export function setAuthorization(username: string, password: string): void {
  authorizationHeader = createAuthorizationHeader(username, password);
}

export function getAuthorization(): string | null {
  return authorizationHeader;
}

export function clearAuthorization(): void {
  authorizationHeader = null;
}
