import type { Metadata } from "next";
import "./globals.css";
import { inter } from "@/fonts/inter";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: {
    default: "App | Neptune EHSS",
    template: "%s | App | Neptune EHSS",
  },
  description:
    "One platform for safety, compliance, and sustainability, built for frontline and EHS teams.",
  openGraph: {
    title: "App | Neptune EHSS",
    description:
      "One platform for safety, compliance, and sustainability, built for frontline and EHS teams.",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/favicon-black.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-white.png",
        type: "image/png",
        sizes: "512x512",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint, so a dark-theme user never sees a white flash.
            It only writes `data-theme` / `color-scheme` on <html>; ThemeProvider
            adopts that value on mount rather than recomputing it. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-screen w-full">
        {/* The ambient gradient ground now lives on `body` in globals.css as
            --ehs-shell-bg, so it changes with the theme. It used to be an
            inline style here, which no theme could reach. */}
        <ThemeProvider>
          <StoreProvider>
            <QueryProvider>
              {children}
              <ToastProvider />
            </QueryProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
