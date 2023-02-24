import { useState, useEffect } from "react";

export function Loading(props: { children: any }) {
  const [body, setBody] = useState(props.children);
  let dotCount = 0;

  useEffect(() => {
    const intervalId = setInterval(() => {
      dotCount++;
      if (dotCount > 3) dotCount = 0;
      setBody(props.children + ".".repeat(dotCount));
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return <div className="py-4 mt-4">{body}</div>;
}
