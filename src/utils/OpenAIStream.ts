import { getters } from "../config";
import { OpenAIStreamPayload } from "../types";
import { OpenAI } from "openai";



export async function OpenAIStream(payload: OpenAIStreamPayload) {
  console.log(getters.getOpenAiDefinitions().OPENAI_API_KEY);
  const openai = new OpenAI({
    apiKey: getters.getOpenAiDefinitions().OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    ...payload,
    stream: true,
  });

  // Create a Transform stream to convert OpenAI's stream to Node.js Readable
  const { Transform } = require("stream");
  const transformer = new Transform({
    transform(chunk: { toString: () => string; }, callback: () => void) {
      try {
        const lines = chunk
          .toString()
          .split("\n")
          .filter((line) => line.trim() !== "");
        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            this.push(null); // End stream
            return;
          }
          try {
            const parsed = JSON.parse(message);
            const content = parsed.choices[0]?.delta?.content || "";
            if (content) {
              this.push(content);
            }
          } catch (error) {
            console.error(
              "Could not JSON parse stream message",
              message,
              error,
            );
          }
        }
      } catch (error) {
        console.error("Stream transform error", error);
      }
      callback();
    },
  });

  // Pipe the OpenAI response to our transformer
  const { Readable } = require("stream");
  const readableStream = Readable.from(
    (async function* () {
      for await (const chunk of response) {
        yield chunk;
      }
    })(),
  );

  return readableStream.pipe(transformer);
}
