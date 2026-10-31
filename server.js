import express from "express";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "online" });
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length < 5) {
      return res.status(400).json({
        error: "কমপক্ষে ৫টি historical result দাও।"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: "API key সেট করা হয়নি।"
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      instructions: `Analyze historical K3 results in simple Bangla.
BIG = sum 11-18.
SMALL = sum 3-10.
EVEN = even sum.
ODD = odd sum.
Explain historical counts and patterns.
Never claim guaranteed predictions.`,
      input: JSON.stringify(rows)
    });

    res.json({
      analysis: result.output_text
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI analysis failed."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("TONMOY AI BOT ONLINE");
});
