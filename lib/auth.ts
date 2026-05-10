export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashWithSalt(
  password: string,
  salt: string
): Promise<string> {
  return hashPassword(password + salt);
}

export function generateSalt(username: string): string {
  return `superrhino-${username}-salt-2024`;
}

export function generateFamilyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "RHINO-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
