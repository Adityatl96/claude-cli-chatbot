const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

require("dotenv").config();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const conversationHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  process.stdout.write("\nClaude: ");

  let fullResponse = "";

  const stream = await client.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: conversationHistory,
  });

  for await (const chunk of stream) {
    if (
      chunk.type === "content_block_delta" &&
      chunk.delta.type === "text_delta"
    ) {
      process.stdout.write(chunk.delta.text);
      fullResponse += chunk.delta.text;
    }
  }

  console.log("\n");
  conversationHistory.push({
    role: "assistant",
    content: fullResponse,
  });

  return fullResponse;
}

async function main() {
  console.log("Claude CLI Chat (type 'exit' to quit)\n");

  while (true) {
    const userInput = await prompt("You: ");

    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      break;
    }

    const response = await chat(userInput);
    console.log(`\nClaude: ${response}\n`);
  }
}

main();