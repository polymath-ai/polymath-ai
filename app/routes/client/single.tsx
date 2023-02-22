import {
  useLoaderData,
  useFetcher,
  useSearchParams,
  FetcherWithComponents,
} from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/node";
import { polymathHostConfig } from "~/utils/polymath.config";
import { useEffect, useRef, useState } from "react";

export const loader = async ({ request }: LoaderArgs) => {
  // if there is a query param, load it up and return
  const url = new URL(request.url);
  const queryParam = url.searchParams.get("query");
  let endpointResults = {};

  if (queryParam) {
    let formdata = new FormData();
    formdata.append("query", queryParam);
    formdata.append("omit", "embedding");
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

function Results(props: {
  completion: any;
  fetcher: FetcherWithComponents<any>;
}) {
  const completion = props.completion;
  const fetcher = props.fetcher;

  if (!completion) {
    return null;
  }

  let isFetchingClass = fetcher.state === "submitting" ? "opacity-20" : "";

  return (
    <>
      <div id="results" className="py-4 mt-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Results
        </h2>
        <div id="completion" className="p-2">
          {completion.completion}
        </div>
      </div>

      <div className="py-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Sources
        </h2>
        <ul role="list" className="divide-y divide-gray-200 {isFetchingClass}">
          {completion?.infos?.map(
            (
              info: {
                description: any;
                title: any;
                url: any;
              },
              index: string
            ) => (
              <li className="flex py-4" key={index}>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 hover:text-indigo-700">
                    <a href="{info.url}" title="{info?.title}">
                      {info?.title || info?.description || info?.url}
                    </a>
                  </p>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
    </>
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

  const [queryValue, setQueryValue] = useState(queryParam || "");

  const funQueries = polymathHostConfig?.info?.fun_queries;
  const randomFunQuery = () => {
    let validFunQueries = funQueries.filter((query) => query !== queryValue);

    const randomFunQuery =
      validFunQueries[Math.floor(Math.random() * validFunQueries.length)];

    setQueryValue(randomFunQuery);
  };

  useEffect(() => {
    if (
      fetcher.type === "done" &&
      fetcher.data?.bits &&
      queryParam != queryValue
    ) {
      // console.log("setSearchParams:", queryValue);
      setSearchParams({ query: queryValue });
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
      <h3 className="text-l italic p-2">Single Endpoint Completion Client</h3>

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
          <div className="py-4">
            <button
              id="ask"
              type="submit"
              className="btn-primary disabled:opacity-50"
            >
              Ask Me
            </button>
          </div>
        </div>
      </fetcher.Form>

      <Results completion={fetcher?.data || json} fetcher={fetcher} />
    </main>
  );
}
