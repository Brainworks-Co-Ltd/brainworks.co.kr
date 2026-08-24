import { getLocalizedPath, type Locale } from "@/shared/routing/routes";

type LocalizedText = Record<Locale, string>;

type NavigationChildDefinition = {
  id: string;
  hrefRouteKey: string;
  activeRouteKeys: string[];
  label: LocalizedText;
  description: LocalizedText;
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
  "label" | "description"
> & {
  label: string;
  description: string;
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
        description: {
          ko: "브레인웍스의 방향과 책임",
          en: "Our direction and responsibility",
        },
      },
      {
        id: "history",
        hrefRouteKey: "about.history",
        activeRouteKeys: ["about.history"],
        label: { ko: "회사 연혁", en: "History" },
        description: {
          ko: "주요 성장 과정과 기록",
          en: "Milestones and company history",
        },
      },
      {
        id: "honors",
        hrefRouteKey: "about.honors",
        activeRouteKeys: ["about.honors"],
        label: { ko: "수상 및 인증", en: "Awards & Certifications" },
        description: {
          ko: "확인 가능한 수상·선정 근거",
          en: "Verified awards and qualifications",
        },
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
        description: {
          ko: "산업별 AI 사업 영역과 솔루션",
          en: "AI domains and industry solutions",
        },
      },
      {
        id: "consulting",
        hrefRouteKey: "consulting",
        activeRouteKeys: ["consulting"],
        label: { ko: "AI 컨설팅", en: "AI Consulting" },
        description: {
          ko: "전략부터 구축·확산까지",
          en: "From strategy through adoption",
        },
      },
      {
        id: "education",
        hrefRouteKey: "education",
        activeRouteKeys: ["education"],
        label: { ko: "AI 전문교육", en: "AI Academy" },
        description: {
          ko: "현장·직무 중심 AI 교육",
          en: "Practice-led AI education",
        },
      },
      {
        id: "global",
        hrefRouteKey: "globalPrograms",
        activeRouteKeys: ["globalPrograms"],
        label: { ko: "글로벌 프로그램", en: "Global Programs" },
        description: {
          ko: "해외 진출과 국제 협력 프로그램",
          en: "International growth and collaboration",
        },
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
        description: {
          ko: "사업·협력·교육 소식",
          en: "Business and partnership stories",
        },
      },
      {
        id: "notices",
        hrefRouteKey: "notices.list",
        activeRouteKeys: ["notices.list", "notices.detail"],
        label: { ko: "공지사항", en: "Notices" },
        description: {
          ko: "주요 안내와 운영 공지",
          en: "Official notices and updates",
        },
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
        description: child.description[locale],
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
