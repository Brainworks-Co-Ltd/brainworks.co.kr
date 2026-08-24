import { getLocalizedPath, type Locale } from "@/shared/routing/routes";

type LocalizedText = Record<Locale, string>;

type NavigationChildDefinition = {
  id: string;
  hrefRouteKey: string;
  activeRouteKeys: string[];
  label: LocalizedText;
};

type NavigationGroupDefinition = {
  id: "company" | "business" | "news";
  type: "group";
  label: LocalizedText;
  children: NavigationChildDefinition[];
};

type NavigationLinkDefinition = {
  id: "contact";
  type: "link";
  hrefRouteKey: "contact";
  activeRouteKeys: ["contact"];
  label: LocalizedText;
  children?: never;
};

type NavigationDefinition =
  NavigationGroupDefinition | NavigationLinkDefinition;

export type PublicNavigationChild = Omit<
  NavigationChildDefinition,
  "label"
> & {
  label: string;
  href: string;
};

export type PublicNavigationItem =
  | (Omit<NavigationGroupDefinition, "label" | "children"> & {
      label: string;
      children: PublicNavigationChild[];
      href?: never;
    })
  | (Omit<NavigationLinkDefinition, "label"> & {
      label: string;
      href: string;
      children?: never;
    });

const definitions: NavigationDefinition[] = [
  {
    id: "company",
    type: "group",
    label: { ko: "회사소개", en: "Company" },
    children: [
      {
        id: "ceo",
        hrefRouteKey: "about.ceo",
        activeRouteKeys: ["about.ceo"],
        label: { ko: "CEO 인사말", en: "CEO Message" },
      },
      {
        id: "history",
        hrefRouteKey: "about.history",
        activeRouteKeys: ["about.history"],
        label: { ko: "회사 연혁", en: "History" },
      },
      {
        id: "honors",
        hrefRouteKey: "about.honors",
        activeRouteKeys: ["about.honors"],
        label: { ko: "수상 및 인증", en: "Awards & Certifications" },
      },
    ],
  },
  {
    id: "business",
    type: "group",
    label: { ko: "사업 영역", en: "Business" },
    children: [
      {
        id: "solutions",
        hrefRouteKey: "solutions.list",
        activeRouteKeys: ["solutions.list"],
        label: { ko: "AI 솔루션", en: "AI Solutions" },
      },
      {
        id: "consulting",
        hrefRouteKey: "consulting",
        activeRouteKeys: ["consulting"],
        label: { ko: "AI 컨설팅", en: "AI Consulting" },
      },
      {
        id: "education",
        hrefRouteKey: "education",
        activeRouteKeys: ["education"],
        label: { ko: "AI 전문교육", en: "AI Academy" },
      },
      {
        id: "global",
        hrefRouteKey: "globalPrograms",
        activeRouteKeys: ["globalPrograms"],
        label: { ko: "글로벌 프로그램", en: "Global Programs" },
      },
    ],
  },
  {
    id: "news",
    type: "group",
    label: { ko: "소식", en: "News" },
    children: [
      {
        id: "news-list",
        hrefRouteKey: "news.list",
        activeRouteKeys: ["news.list", "news.detail"],
        label: { ko: "뉴스", en: "News" },
      },
      {
        id: "notices",
        hrefRouteKey: "notices.list",
        activeRouteKeys: ["notices.list", "notices.detail"],
        label: { ko: "공지사항", en: "Notices" },
      },
    ],
  },
  {
    id: "contact",
    type: "link",
    hrefRouteKey: "contact",
    activeRouteKeys: ["contact"],
    label: { ko: "문의하기", en: "Contact" },
  },
];

export function buildPublicNavigation(locale: Locale): PublicNavigationItem[] {
  return definitions.map((item) => {
    if (item.type === "link") {
      return {
        ...item,
        label: item.label[locale],
        href: getLocalizedPath(item.hrefRouteKey, locale),
      };
    }

    return {
      ...item,
      label: item.label[locale],
      children: item.children.map((child) => ({
        ...child,
        label: child.label[locale],
        href: getLocalizedPath(child.hrefRouteKey, locale),
      })),
    };
  });
}

export function getActiveNavigationGroup(
  routeKey: string | null,
): PublicNavigationItem["id"] | null {
  if (!routeKey) {
    return null;
  }

  for (const item of definitions) {
    if (
      item.type === "link" &&
      item.activeRouteKeys.includes(routeKey as "contact")
    ) {
      return item.id;
    }

    if (
      item.type === "group" &&
      item.children.some((child) => child.activeRouteKeys.includes(routeKey))
    ) {
      return item.id;
    }
  }

  return null;
}
