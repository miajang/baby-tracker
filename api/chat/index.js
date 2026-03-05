module.exports = async function (context, req) {
  if (req.method !== "POST") {
    context.res = { status: 405, body: "Method not allowed" };
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    context.res = { status: 500, body: JSON.stringify({ error: "API key not configured" }) };
    return;
  }

  try {
    const { system, messages } = req.body;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      context.res = { status: res.status, body: JSON.stringify({ error: data.error?.message || "API error" }) };
      return;
    }

    const text = data.content?.map((b) => b.text || "").join("\n") || "";
    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (e) {
    context.res = { status: 500, body: JSON.stringify({ error: "Server error" }) };
  }
};
