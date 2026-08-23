type AccountStatus = "ACTIVE" | "INACTIVE" | string;

export function isActiveAdmin(account: {
  role?: string | null;
  accountStatus?: AccountStatus | null;
}) {
  return account.role === "ADMIN" && account.accountStatus === "ACTIVE";
}

export function normalizeReturnTo(value: string | string[] | undefined) {
  const returnTo = Array.isArray(value) ? value[0] : value;
  if (
    !returnTo ||
    !returnTo.startsWith("/admin") ||
    returnTo.startsWith("//")
  ) {
    return "/admin";
  }
  return returnTo;
}

export function shouldExposeGenericResetResponse() {
  return true;
}
