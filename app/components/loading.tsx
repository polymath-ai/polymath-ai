import { useState, useEffect } from "react";

let loadingMessages = [
  "☎️ Giving the Polymaths a ring",
  "🙏 Praying to the AI gods",
  "🪥 Quickly brushing teeth",
  "☕ Brewing some coffee",
  "🏃 Running around the block",
  "🏌️‍♂️ Packing for a round of golf",
  "⚽ Watching Spurs beat Arsenal",
];

export function Loading() {
  const [body, setBody] = useState("");
  let dotCount = 0;
  let messageCount = 0;

  useEffect(() => {
    const intervalId = setInterval(() => {
      dotCount++;
      if (dotCount > 3) {
        dotCount = 0;
        messageCount++;
        if (messageCount > loadingMessages.length) messageCount = 0;
      }
      setBody(loadingMessages[messageCount] + ".".repeat(dotCount));
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return <div className="py-4 mt-4">{body}</div>;
}
