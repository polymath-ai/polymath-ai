import { Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main className="p-4">
      <h1 className="text-2xl px-4">Welcome to this Polymath!</h1>

      <p className="p-4">
        Here are of the things I can do. I'm a work in progress.
      </p>

      <div className="p-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Clients
        </h2>

        <ul role="list" className="divide-y divide-gray-200">
          <li className="py-2">
            <Link to="/client/local">Ask this endpoint for context</Link>
          </li>
          <li className="py-2">
            <Link to="/client/single">Single Client</Link>
          </li>
          <li className="py-2">
            <Link to="/client/multi">Multi Client</Link>
          </li>
        </ul>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Endpoint
        </h2>

        <ul role="list" className="divide-y divide-gray-200">
          <li className="py-2">
            <Link to="/endpoint">Endpoint</Link>
          </li>
        </ul>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Completion
        </h2>

        <ul role="list" className="divide-y divide-gray-200">
          <li className="py-2">
            <Link to="/completion">Endpont Completion</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
