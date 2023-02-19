import { Form } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Polymath</h1>

      <h2>Clients</h2>

      <ul>
        <li><Link to="/client/local">Ask this endpoint for context</Link></li>
        <li><Link to="/client/single">Single Client</Link></li>
        <li><Link to="/client/multi">Multi Client</Link></li>
      </ul>
      
      <h2>Endpoint</h2>

      <ul>
        <li><Link to="/endpoint">Endpoint</Link></li>
      </ul>

      <h2>Completion</h2>

      <ul>
        <li><Link to="/completion">Endpoint</Link></li>
      </ul>
    </div>
  );
}


