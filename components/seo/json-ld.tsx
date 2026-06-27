import { siteConfig } from "@/config/site";

/** Renders a JSON-LD <script> tag. Pass any valid Schema.org object. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ── Schema builders ──────────────────────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/icons/icon-512x512.png`,
      width: 512,
      height: 512,
    },
    description: siteConfig.description,
    email: "support@simkuu.com",
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/simkuu",
      "https://instagram.com/simkuu",
      "https://linkedin.com/company/simkuu",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@simkuu.com",
      availableLanguage: ["English"],
      hoursAvailable: "Mo-Su 00:00-23:59",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/plans?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productSchema({
  name, description, price, carrier, slug,
}: {
  name: string; description: string; price: number; carrier: string; slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${siteConfig.url}/plans/${slug}`,
    name,
    description,
    brand: { "@type": "Brand", name: carrier },
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/plans/${slug}`,
      priceCurrency: "USD",
      price: (price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@id": `${siteConfig.url}/#organization` },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 1,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        deliveryTime: { "@type": "ShippingDeliveryTime", handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "MIN" } },
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1847",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.href}`,
    })),
  };
}

export function articleSchema({
  title, description, slug, datePublished, dateModified, authorName,
}: {
  title: string; description: string; slug: string;
  datePublished: string; dateModified?: string; authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${siteConfig.url}/blog/${slug}`,
    headline: title,
    description,
    image: `${siteConfig.url}/og/blog/${slug}.png`,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icons/icon-512x512.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/blog/${slug}` },
  };
}

export function reviewSchema(reviews: { author: string; rating: number; reviewBody: string; datePublished: string }[]) {
  return reviews.map(r => ({
    "@context": "https://schema.org",
    "@type": "Review",
    reviewBody: r.reviewBody,
    reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    author: { "@type": "Person", name: r.author },
    datePublished: r.datePublished,
    itemReviewed: { "@id": `${siteConfig.url}/#organization` },
  }));
}

export function serviceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "eSIM Provider",
    name: "USA eSIM Plans",
    provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: { "@type": "Country", name: "United States" },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "USA eSIM Plans",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "T-Mobile eSIM" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Verizon eSIM" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "AT&T eSIM" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "MVNO eSIM" } },
      ],
    },
  };
}
