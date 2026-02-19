export function getNormalizedRoleCode(role: unknown): string {
  if (typeof role === "string") {
    return role.toLowerCase();
  }

  if (Array.isArray(role)) {
    return getNormalizedRoleCode(role[0]);
  }

  if (role && typeof role === "object") {
    const roleObj = role as Record<string, unknown>;

    const candidates = [roleObj.code, roleObj.name, roleObj.role];
    for (const candidate of candidates) {
      if (typeof candidate === "string") {
        return candidate.toLowerCase();
      }
    }
  }

  return "";
}
