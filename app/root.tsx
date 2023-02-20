import polymathHostConfig from "~/host.SECRET.json";

import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: (polymathHostConfig.info.headername || "") + " Polymath",
  viewport: "width=device-width,initial-scale=1",
});

import stylesheet from "~/tailwind.css";
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  {
    rel: "icon",
    type: "image/png",
    sizes: "32x32",
    href: "/favicon-32x32.png",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "16x16",
    href: "/favicon-16x16.png",
  },
  { rel: "shortcut icon", href: "/favicon.ico" },
  { rel: "manifest", href: "/site.webmanifest" },
];

function Header() {
  return (
    <header className="flex justify-center items-center text-center p-4">
      <a
        href="/"
        id="logo"
        title="Ok, query me again!"
        className="rounded-tl-[25%] rounded-br-[25%] rounded-tr-[10%] rounded-bl-[10%] overflow-hidden hover:brightness-110 active:brightness-110"
      >
        <img
          src="/polymath-logo-120x120.png"
          width="120"
          height="120"
          className="float-left"
          alt=""
        />
      </a>
      <div className="px-5 float-right border-b-0">
        <h1 className="text-2xl md:text-3xl text-center font-bold">
          {polymathHostConfig.info.headername || ""} Polymath
        </h1>
        <div className="w-full border-t-0 text-sm md:text-base">
          This is a{" "}
          <a
            href="https://github.com/dglazkov/polymath"
            className="text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            polymath
          </a>{" "}
          endpoint.
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
