import Link from "http-link-header";
import * as htmlparser2 from "htmlparser2";

function parseBody(body: string, url: URL): URL | undefined {
  let polymathURL;
  const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
      if (name !== "link" || attributes.rel !== "polymath") {
        return;
      }

      const href = attributes.href;

      if (
        (href != undefined && href.startsWith("http://")) ||
        href.startsWith("https://")
      ) {
        polymathURL = new URL(attributes.href);
      } else {
        // We need to resolve the paths.
        polymathURL = new URL(attributes.href, url);
      }
      parser.end();
    },
  });
  parser.write(body);
  parser.end();
  return polymathURL;
}

export interface ResponseData {
  status?: number;
  statusText?: string;
  text: string;
}

export class DiscoveryError extends Error {
  public data: ResponseData;

  constructor(data: ResponseData) {
    super(data.statusText);
    this.name = "DiscoverError";
    this.data = data;
  }
}

/*
  Discover a polymath endpoint in a page.
  1. Check the HTTP Header: Link: <https://paul.kinlan.me/api/polymath>; rel=polymath
  2. Check the body of the text for <link rel="polymath">
*/
export async function discoverEndpoint(url: URL): Promise<URL> {
  // GET the current URL.
  const discoveryResponse = await fetch(url);

  if (!discoveryResponse.ok) {
    throw new DiscoveryError({
      status: discoveryResponse.status,
      statusText: discoveryResponse.statusText,
      text: await discoveryResponse.text(),
    });
  }

  // Check the HTTP Header
  const linkHeader = discoveryResponse.headers.get("link");
  if (linkHeader != undefined) {
    const link = Link.parse(linkHeader);

    if (link.has("rel", "polymath")) {
      const linkUrls = link.get("rel", "polymath");
      const firstUrl = linkUrls[0].uri;
      if (firstUrl.startsWith("http://") || firstUrl.startsWith("https://")) {
        return new URL(firstUrl);
      }

      // We need to resolve the paths.
      return new URL(firstUrl, url);
    }
  }

  // Check the body
  const body = await discoveryResponse.text();
  if (body == undefined)
    throw new DiscoveryError({
      status: discoveryResponse.status,
      statusText: discoveryResponse.statusText,
      text: "No body found in response",
    });

  const polymathURL = parseBody(body, url);
  if (!polymathURL)
    throw new DiscoveryError({
      text: "No link found in body",
    });
  return polymathURL;
}
