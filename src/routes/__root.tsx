import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "@/pages/NotFound";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

const SITE_URL = "https://car-sharing-vs-rental-car.lovable.app";

const webApplicationJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "タイムズカーシェア vs タイムズレンタカー 料金比較ツール",
  description:
    "タイムズカーシェアとタイムズレンタカーの料金を比較できる無料ツール。利用時間・走行距離・車種を入力するだけで、どちらがお得か自動計算します。",
  url: SITE_URL,
  applicationCategory: "UtilityApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  featureList: [
    "カーシェアとレンタカーの料金比較",
    "損益分岐点の自動計算",
    "複数車種対応",
    "ガソリン代・高速料金の計算",
  ],
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "タイムズカーシェアとタイムズレンタカーはどちらがお得？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "利用時間と走行距離によって異なります。短時間・短距離ならカーシェア、長時間・長距離ならレンタカーがお得になる傾向があります。このツールで具体的な条件を入力すると、どちらがお得か自動計算できます。",
      },
    },
    {
      "@type": "Question",
      name: "タイムズカーシェアの距離料金はいつ発生する？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "タイムズカーシェアでは走行距離が一定を超えると距離料金が発生します。車種によって料金は異なりますが、長距離ドライブの場合はレンタカーの方がお得になることがあります。",
      },
    },
    {
      "@type": "Question",
      name: "カーシェアの給油割引とは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "タイムズカーシェアでは、20L以上の給油をすると30分の時間料金が割引されます。さらに洗車をすると追加で30分割引されます。",
      },
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "タイムズカーシェア vs タイムズレンタカー 料金比較ツール | どっちがお得？" },
      {
        name: "description",
        content:
          "タイムズカーシェアとタイムズレンタカーの料金を簡単比較。利用時間・走行距離・車種を入力するだけで、どちらがお得か自動計算。損益分岐点も表示します。",
      },
      {
        name: "keywords",
        content:
          "タイムズカーシェア,タイムズレンタカー,料金比較,カーシェア,レンタカー,どっちがお得,料金シミュレーション",
      },
      { name: "author", content: "Lovable" },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "タイムズカーシェア vs タイムズレンタカー 料金比較ツール" },
      {
        property: "og:description",
        content:
          "タイムズカーシェアとタイムズレンタカーの料金を簡単比較。利用時間・走行距離・車種を入力するだけで、どちらがお得か自動計算。",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${SITE_URL}/og-image.png?v=2` },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "ja_JP" },
      { property: "og:site_name", content: "カーシェア vs レンタカー料金比較" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "タイムズカーシェア vs タイムズレンタカー 料金比較ツール" },
      {
        name: "twitter:description",
        content: "タイムズカーシェアとタイムズレンタカーの料金を簡単比較。どちらがお得か自動計算します。",
      },
      { name: "twitter:image", content: `${SITE_URL}/og-image.png?v=2` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "canonical", href: SITE_URL },
    ],
    scripts: [
      { type: "application/ld+json", children: webApplicationJsonLd },
      { type: "application/ld+json", children: faqJsonLd },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  console.error(error);

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">This page didn't load</h1>
        <p className="text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-medium"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a
            className="px-4 py-2 rounded-md border border-border bg-card text-foreground font-medium"
            href="/"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
