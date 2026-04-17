import { define } from "../utils.ts";
import {
  buildPageTitle,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_THEME_COLOR,
} from "@/lib/site/brand.ts";

export default define.page(function App({ Component, url }) {
  const isDailyPage = url.pathname.startsWith("/daily");
  const pageTitle = isDailyPage
    ? buildPageTitle("Daily Puzzle")
    : buildPageTitle();

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <title>{pageTitle}</title>
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="description" content={SITE_DESCRIPTION} />
        <meta name="theme-color" content={SITE_THEME_COLOR} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        style={{
          margin: 0,
          background: "#0f180d",
          overscrollBehaviorX: "none",
          overflowX: "hidden",
        }}
      >
        <Component />
      </body>
    </html>
  );
});
