import { getLocalizedBusinessAreas } from "@/data/businessAreas";
import { getLocalizedPath, type Locale } from "@/shared/routing/routes";

export type BusinessMegaMenuArea = {
  id: string;
  label: string;
  href: string;
  image: string;
  alt: string;
};

export type BusinessMegaMenuService = {
  id: string;
  label: string;
  href: string;
  activeRouteKeys: string[];
};

export type PublicBusinessMegaMenu = {
  featured: {
    label: string;
    href: string;
  };
  areas: BusinessMegaMenuArea[];
  services: BusinessMegaMenuService[];
};

type NavigationChild = BusinessMegaMenuService;

export function buildBusinessMegaMenu(
  locale: Locale,
  children: NavigationChild[],
): PublicBusinessMegaMenu {
  const localizedAreas = getLocalizedBusinessAreas(locale);
  const solution = children.find((child) => child.id === "solutions");
  const services = children.filter((child) =>
    ["consulting", "education", "global"].includes(child.id),
  );

  return {
    featured: {
      label: solution?.label || (locale === "ko" ? "AI 솔루션" : "AI Solutions"),
      href: solution?.href || getLocalizedPath("solutions.list", locale),
    },
    areas: localizedAreas.map((area) => ({
      id: area.id,
      label: area.title,
      href: `${getLocalizedPath("solutions.list", locale)}?area=${encodeURIComponent(area.id)}`,
      image: area.heroImage,
      alt: area.title,
    })),
    services,
  };
}
