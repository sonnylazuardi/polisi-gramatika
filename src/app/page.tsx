import { useState, useRef } from "react";

const Home = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponse("");
    setIsLoading(true);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const url = new URL("http://localhost:3000"); // Change to your backend URL
    url.searchParams.append("prompt", prompt);

    eventSourceRef.current = new EventSource(url.toString());

    eventSourceRef.current.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setResponse((prev) => prev + parsedData.response);
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("EventSource failed:", error);
      setIsLoading(false);
      eventSourceRef.current?.close();
    };

    eventSourceRef.current.onclose = () => {
      setIsLoading(false);
    };
  };

  return (
    <div>
      <h1>Prompt Streamer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </form>
      <div>
        <h2>Response:</h2>
        <pre>{response}</pre>
      </div>
    </div>
  );
};

export default Home;
