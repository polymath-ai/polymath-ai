import LinkHeader from "http-link-header";
import { Parser } from "htmlparser2";

function parseBody(body: string): string | undefined {
  let polymathURL;
  const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
      if (name !== "link" || attributes.rel !== "polymath") {
        return;
      }

      polymathURL = attributes.href;
      parser.parseComplete(); 
    }
  });
  parser.write(body);
  parser.end();
  return polymathURL;
}

/*
  Discover a polymath endpoint in a page.
  1. Check the HTTP Header: Link: <https://paul.kinlan.me/api/polymath>; rel=polymath
  2. Check the body of the text for <link rel="polymath">
*/
export async function discoverEndpoint(url: URL): Promise<URL | undefined> {
  // GET the current URL.
  try {
    const discoveryResponse = await fetch(url);

    if (discoveryResponse.ok == false) return;

    // Check the HTTP Header
    const linkHeader = discoveryResponse.headers.get("link");
    const link = LinkHeader.parse(linkHeader);

    if (link.has("rel", "polymath")) {
      const linkUrls: string[] = link.get("rel", "polymath");
      const firstUrl = linkUrl[0];
      if (firstUrl.startsWith("http://") || firstUrl.startsWith("https://")) {
        return new URL(firstUrl);
      }

      // We need to resolve the paths.
      return new URL(firstUrl, url);
    }

    // Check the body
    const body = await discoveryResponse.text();
    if (body != undefined) {
      return parseBody(body);
    }
  } catch (error) {
    console.error("Error during discovery: " + error);
  }
}