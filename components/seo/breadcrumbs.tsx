import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { JsonLd, breadcrumbSchema } from "./json-ld";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const allItems = [{ name: "Home", href: "/" }, ...items];

  return (
    <>
      <JsonLd data={breadcrumbSchema(allItems)} />
      <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-sm ${className}`}>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          return (
            <span key={item.href} className="flex items-center gap-1.5">
              {index === 0 ? (
                <Link href={item.href} className="text-black/30 hover:text-black transition-colors flex items-center">
                  <Home className="w-3.5 h-3.5" />
                </Link>
              ) : isLast ? (
                <span className="text-black font-medium" aria-current="page">{item.name}</span>
              ) : (
                <Link href={item.href} className="text-black/40 hover:text-black transition-colors">{item.name}</Link>
              )}
              {!isLast && <ChevronRight className="w-3.5 h-3.5 text-black/20 flex-shrink-0" />}
            </span>
          );
        })}
      </nav>
    </>
  );
}
