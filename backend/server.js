const express = require("express");
const cors = require("cors");
const proxyRouter = require("./routes/proxy");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/proxy", proxyRouter);

app.listen(PORT, () => {
  console.log(`Bema backend running on http://localhost:${PORT}`);
});
