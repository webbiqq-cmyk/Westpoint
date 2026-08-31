const express = require("express");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.get("/api/demo-health", (_req, res) => {
    res.json({
      service: "Westpoint Gate + CCTV Remote Access Security Demo",
      mode: "software-demo",
      hardwareConnected: false,
      ok: true
    });
  });

  server.all("*", (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`Westpoint demo running at http://localhost:${port}`);
  });
});
