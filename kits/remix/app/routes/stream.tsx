import { FetcherWithComponents, Form } from "@remix-run/react";
import { Await } from "@remix-run/react";
import { useLoaderData, useFetcher, useSearchParams } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import { Suspense, useEffect, useRef, useState } from "react";
import { polymathHostConfig } from "~/utils/polymath.config";
import { Loading } from "~/components/loading";

function Answer(props: { with: any }) {
  const answer = props.with;

  if (!answer) {
    return null;
  }

  return (
    <>
      <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
        Results
      </h2>
      <div id="completion" className="p-2">
        {answer}
      </div>
    </>
  );
}

function Sources(props: { response: any }) {
  const response = props.response;

  return (
    <div className="py-4">
      <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
        Sources
      </h2>
      <ul className="divide-y divide-gray-200">
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
            const sourcePrefixes = polymathHostConfig?.info?.source_prefixes;

            if (sourcePrefixes) {
              for (const url in sourcePrefixes) {
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
  );
}

export default function ClientStream(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get("query");

  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState("");
  const [loading, setLoading] = useState(false);

  const [queryValue, setQueryValue] = useState(queryParam || "");

  const funQueries = polymathHostConfig?.info?.fun_queries;
  const randomFunQuery = () => {
    if (funQueries) {
      const validFunQueries = funQueries.filter(
        (query) => query !== queryValue
      );

      const randomFunQuery =
        validFunQueries[Math.floor(Math.random() * validFunQueries.length)];

      setQueryValue(randomFunQuery);
    }
  };

  const canAsk = queryValue?.trim().length < 1;

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const query = formData.get("query");

    setAnswer("");
    setSources("");
    setLoading(true);

    const sse = new EventSource(`/endpoint/stream?query=${query}`);

    sse.addEventListener("message", (event) => {
      console.log("event: ", event);
      const message = JSON.parse(event.data);
      if (message.answer) {
        setLoading(false);
        setAnswer((prevResults) => prevResults + message.answer);
      } else if (message.final) {
        setLoading(false);
        setSources(message.final);
        sse.close();
      }
    });

    sse.addEventListener("error", (event) => {
      console.log("error: ", event);
      sse.close();
    });
  };

  return (
    <main className="p-4">
      <Form onSubmit={handleFormSubmit}>
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
              disabled={canAsk}
            >
              Ask Me
            </button>
          </div>
        </div>
      </Form>

      {loading && <Loading query={queryValue} />}

      <div id="results" className="py-4 mt-4">
        {answer && <Answer with={answer} />}
        {sources && <Sources response={sources} />}
      </div>
    </main>
  );
}
