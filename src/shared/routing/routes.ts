export const supportedLocales = ["ko", "en"] as const;
export type Locale = (typeof supportedLocales)[number];

type RouteDefinition = {
  key: string;
  path: string;
};

const routeDefinitions: RouteDefinition[] = [
  { key: "home", path: "/" },
  { key: "about.ceo", path: "/about" },
  { key: "about.history", path: "/about/history" },
  { key: "about.honors", path: "/about/honors" },
  { key: "solutions.list", path: "/services" },
  { key: "consulting", path: "/consulting" },
  { key: "education", path: "/education" },
  { key: "globalPrograms", path: "/global-programs" },
  { key: "news.list", path: "/news" },
  { key: "news.detail", path: "/news/:slug" },
  { key: "notices.list", path: "/notices" },
  { key: "notices.detail", path: "/notices/:slug" },
  { key: "contact", path: "/contact" },
];

const dynamicRouteDefinitions = routeDefinitions.filter((route) =>
  route.path.includes(":"),
);

function normalizePath(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;

  if (withLeadingSlash === "/") {
    return "/";
  }

  return withLeadingSlash.replace(/\/+$/, "");
}

function withoutLocale(pathname: string): string {
  const normalized = normalizePath(pathname);
  return normalized === "/en"
    ? "/"
    : normalized.replace(/^\/en(?=\/|$)/, "") || "/";
}

function withLocale(pathname: string, locale: Locale): string {
  const normalized = normalizePath(pathname);
  return locale === "en"
    ? normalized === "/"
      ? "/en"
      : `/en${normalized}`
    : normalized;
}

function definitionMatchesPath(
  definition: RouteDefinition,
  pathname: string,
): boolean {
  if (!definition.path.includes(":")) {
    return definition.path === pathname;
  }

  const pattern = new RegExp(
    `^${definition.path.replace(/:[^/]+/g, "[^/]+")}$`,
  );
  return pattern.test(pathname);
}

function paramsFromPath(
  definition: RouteDefinition,
  pathname: string,
): Record<string, string> {
  const definitionParts = definition.path.split("/").filter(Boolean);
  const pathnameParts = pathname.split("/").filter(Boolean);

  return definitionParts.reduce<Record<string, string>>(
    (params, part, index) => {
      if (part.startsWith(":")) {
        params[part.slice(1)] = pathnameParts[index] || "";
      }
      return params;
    },
    {},
  );
}

export function isSupportedLocale(value: string | undefined): value is Locale {
  return value === "ko" || value === "en";
}

export function getLocaleFromPath(pathname: string): Locale {
  return normalizePath(pathname).split("/")[1] === "en" ? "en" : "ko";
}

export function getRouteKey(pathname: string): string | null {
  const normalized = withoutLocale(pathname);
  const exact = routeDefinitions.find(
    (definition) => definition.path === normalized,
  );
  if (exact) {
    return exact.key;
  }

  return (
    dynamicRouteDefinitions.find((definition) =>
      definitionMatchesPath(definition, normalized),
    )?.key || null
  );
}

export function getLocalizedPath(
  routeKey: string,
  locale: Locale,
  params: Record<string, string> = {},
): string {
  const definition = routeDefinitions.find((route) => route.key === routeKey);
  if (!definition) {
    throw new Error(`알 수 없는 라우트 키입니다: ${routeKey}`);
  }

  const path = definition.path.replace(/:([^/]+)/g, (_, name: string) => {
    const value = params[name];
    if (!value) {
      throw new Error(`${routeKey} 라우트에 ${name} 파라미터가 필요합니다.`);
    }
    return encodeURIComponent(value);
  });

  return withLocale(path, locale);
}

export function getLocaleSwitchPath(
  pathname: string,
  targetLocale: Locale,
): string {
  const normalized = withoutLocale(pathname);
  const route = routeDefinitions.find((definition) =>
    definitionMatchesPath(definition, normalized),
  );

  if (!route) {
    return withLocale(normalized, targetLocale);
  }

  return getLocalizedPath(
    route.key,
    targetLocale,
    paramsFromPath(route, normalized),
  );
}
