"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

    const url = new URL("https://cloudflare-hono.sonnylazuardi.workers.dev/"); // Change to your backend URL
    url.searchParams.append("prompt", prompt);

    eventSourceRef.current = new EventSource(url.toString());

    eventSourceRef.current.onmessage = (event) => {
      if (event.data === "[DONE]") {
        setIsLoading(false);
        eventSourceRef.current?.close();
        return;
      }

      try {
        const parsedData = JSON.parse(event.data);
        setResponse((prev) => prev + parsedData.response);
      } catch (error) {
        console.error("Failed to parse message:", event.data, error);
      }
    };

    eventSourceRef.current.onerror = (error) => {
      console.error("EventSource failed:", error);
      setIsLoading(false);
      eventSourceRef.current?.close();
    };

    //@ts-ignore
    eventSourceRef.current.onclose = () => {
      setIsLoading(false);
    };
  };

  return (
    <div className="p-4">
      <Card className="mb-4">
        <CardContent className="p-4">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
            Polisi Gramatika
          </h4>
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt"
              className="mb-2"
            />
            <Button type="submit" color="primary" disabled={isLoading}>
              {isLoading ? (
                <div role="status">
                  <span>Memeriksa...</span>
                </div>
              ) : (
                "Periksa"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          {response.length ? (
            <div>
              <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2">
                Hasil:
              </h4>
              <code className="block whitespace-pre-wrap">
                <pre className="whitespace-pre-wrap break-words">
                  {response}
                </pre>
              </code>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
