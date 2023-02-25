import { Link } from "@remix-run/react";

export default function About() {
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
            <Link to="/">Client for full completions</Link>
          </li>
          <li className="py-2">
            <Link to="/local">Client for Polymath Results</Link>
          </li>
        </ul>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold border-b border-indigo-500/30 hover:border-indigo-500/60">
          Endpoint
        </h2>

        <ul role="list" className="divide-y divide-gray-200">
          <li className="py-2">
            <Link to="/endpoint/ask">Ask Endpoint for Polymath Results</Link>
          </li>
          <li className="py-2">
            <Link to="/endpoint/complete">
              Ask Endpoint for full completion
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
