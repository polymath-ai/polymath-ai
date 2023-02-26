import {
  useLoaderData,
  useFetcher,
  useSearchParams,
  FetcherWithComponents,
} from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import { polymathHostConfig } from "~/utils/polymath.config";
import { Loading } from "~/components/loading";

export const loader = async ({ request }: LoaderArgs) => {
  // if there is a query param, load it up and return
  const url = new URL(request.url);
  const queryParam = url.searchParams.get("query");
  const serverParams = url.searchParams.getAll("server");

  let endpointResults = {};

  if (queryParam) {
    let formdata = new FormData();
    formdata.append("query", queryParam);
    formdata.append("omit", "embedding");
    serverParams.forEach((server) => {
      formdata.append("server", server);
    });
    let results = await fetch(
      new URL(request.url).origin + "/endpoint/complete",
      {
        method: "POST",
        body: formdata,
      }
    );
    endpointResults = await results.json();
  }

  return json(endpointResults);
};

// function areAllCheckboxesDisabled(formEl: HTMLFormElement | null): boolean {
//   if (formEl === null) {
//     return false;
//   }
//   const checkboxes = formEl.querySelectorAll('input[name="server"]');
//   console.log("Boxes: ", checkboxes);
//   for (let i = 0; i < checkboxes?.length; i++) {
//     if ((checkboxes[i] as HTMLInputElement).checked) {
//       return false; // if any checkbox is checked, return false
//     }
//   }
//   return true; // if no checkboxes are checked, return true
// }

function EndpointPicker(props: { checked: any }) {
  if (!polymathHostConfig.server_options) {
    return null;
  }

  // Only one endpoint server to question so hide it
  if (polymathHostConfig.server_options.length === 1) {
    return (
      <input
        type="hidden"
        name="server"
        value={polymathHostConfig.server_options[0].url}
      />
    );
  }

  return (
    <div className="py-4">
      <label htmlFor="server">Polymath Endpoints</label>

      <ul className="mt-2">
        {polymathHostConfig.server_options.map((server, index) => {
          let serverId = "server" + index;
          let isChecked = props.checked.includes(server.url);
          return (
            <li className="py-1 ml-3" key={index}>
              <input
                id={serverId}
                name="server"
                type="checkbox"
                className="m-2"
                value={server.url}
                defaultChecked={isChecked}
              />
              <label
                htmlFor={serverId}
                className=" text-gray-900 hover:text-indigo-700"
              >
                {server.name}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Results(props: {
  response: any;
  fetcher: FetcherWithComponents<any>;
}) {
  const response = props.response;
  const fetcher = props.fetcher;

  if (!response?.completion) {
    return null;
  }

  let isFetchingClass = fetcher.state === "submitting" ? "opacity-50" : "";

  return (
    <div className={isFetchingClass}>
      <div id="results" className="py-4 mt-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Results
        </h2>
        <div id="completion" className="p-2">
          {response?.completion}
        </div>
      </div>

      <div className="py-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Sources
        </h2>
        <ul role="list" className="divide-y divide-gray-200">
          {response?.infos?.map(
            (
              info: {
                description: any;
                title: any;
                url: any;
              },
              index: string
            ) => {
              let prefix = "";
              let sourcePrefixes = polymathHostConfig?.info?.source_prefixes;

              if (sourcePrefixes) {
                for (let url in sourcePrefixes) {
                  if (info.url.startsWith(url)) {
                    prefix = sourcePrefixes[url];
                    break;
                  }
                }
              }

              return (
                <li className="flex py-4" key={index}>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 hover:text-indigo-700">
                      <a href={info.url} title={info?.title}>
                        {prefix} {info?.title || info?.description || info?.url}
                      </a>
                    </p>
                  </div>
                </li>
              );
            }
          )}
        </ul>
      </div>
    </div>
  );
}

export default function ClientSingle(): JSX.Element {
  // let json = useLoaderData<typeof loader>();
  let json = useLoaderData() as any;

  const fetcher = useFetcher();

  let submitRef = useRef<HTMLButtonElement>(null);
  let formRef = useRef<HTMLFormElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get("query");
  const serverParams = searchParams.getAll("server");

  const [queryValue, setQueryValue] = useState(queryParam || "");

  const funQueries = polymathHostConfig?.info?.fun_queries;
  const randomFunQuery = () => {
    if (funQueries) {
      let validFunQueries = funQueries.filter((query) => query !== queryValue);

      const randomFunQuery =
        validFunQueries[Math.floor(Math.random() * validFunQueries.length)];

      setQueryValue(randomFunQuery);
    }
  };

  let canAsk = queryValue?.trim().length < 1;

  useEffect(() => {
    if (
      fetcher.type === "done" &&
      fetcher.data?.bits &&
      queryParam != queryValue
    ) {
      //   console.log("setSearchParams:", queryValue);
      let newSearchParams = [["query", queryValue]];

      // add any checked <input type="checkbox" name="server" value="..." />
      formRef.current?.querySelectorAll("input[name=server]").forEach((el) => {
        if ((el as HTMLInputElement).checked) {
          newSearchParams.push(["server", (el as HTMLInputElement).value]);
        }
      });

      setSearchParams(new URLSearchParams(newSearchParams));
    }
  }, [fetcher]);

  // once when the page loads, if there is a query param, submit the form and get the results
  // useEffect(() => {
  //   if (fetcher.type === "init" && queryValue === loadQuery) {
  //     console.log("submit the form?:", queryValue);
  //     loadQuery = "";
  //     console.log("Current:", formRef.current);
  //     fetcher.submit(formRef.current, { method: "post" });
  //     // fetcher.submit(
  //     //   { query: "how long is a piece of string?" },
  //     //   { method: "post", action: "/endpoint" }
  //     // );
  //   }
  // }, [fetcher]);

  return (
    <main className="p-4">
      <fetcher.Form method="post" action="/endpoint/complete" ref={formRef}>
        <input type="hidden" name="omit" value="embedding" />
        <div>
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="query"
              placeholder={
                polymathHostConfig?.info?.placeholder ||
                "Give us a question here, please!"
              }
              id="query"
              className="w-full input-primary"
              value={queryValue}
              onChange={(e) => setQueryValue(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {funQueries && (
                <svg
                  id="random-query"
                  className="h-5 w-5 text-gray-400 hover:brightness-110 active:brightness-110 hover:cursor-pointer"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  onClick={randomFunQuery}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"
                  />
                </svg>
              )}
            </div>
          </div>

          <EndpointPicker checked={serverParams} />

          <div className="py-4">
            <button
              id="ask"
              type="submit"
              className="btn-primary disabled:opacity-50"
              disabled={canAsk}
            >
              Ask Me
            </button>
          </div>
        </div>
      </fetcher.Form>

      {fetcher.state === "submitting" && <Loading />}

      <Results response={fetcher?.data || json} fetcher={fetcher} />
    </main>
  );
}
