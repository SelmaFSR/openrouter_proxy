const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.raw({ type: "*/*" }));

app.use(async (req, res) => {
  const targetBase = "https://openrouter.ai";
  const targetUrl = targetBase + req.url;

  // 复制请求头，并将 Host 改为 openrouter.ai
  const headers = { ...req.headers, host: "openrouter.ai" };
  delete headers["host"];   // 删掉多余的原始 host 键

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
      redirect: "follow",
    });

    // 设置 CORS 头，方便跨域访问
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    res.status(response.status);
    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(502).json({ error: "Proxy error: " + error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
