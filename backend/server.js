import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("JobMatch AI Backend Running");
});

app.post("/api/analyse", async (req, res) => {
  try {
    const { cvText } = req.body;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-3-5-sonnet-latest",
        max_tokens: 1200,
        messages: [
          {
            role: "user",
            content: `
You are a professional AI recruiter.

Analyse this CV and return ONLY valid JSON.

Required JSON format:
{
  "keywords": ["skill1", "skill2"],
  "jobTitle": "Business Analyst",
  "jobs": [
    {
      "title": "Senior Business Analyst",
      "company": "Example Ltd",
      "location": "London, UK",
      "type": "Full-time",
      "salary": "£60,000 - £75,000",
      "matchScore": 88,
      "matchedKeywords": ["SQL", "Agile"],
      "postedDays": 2,
      "applyUrl": "https://linkedin.com/jobs",
      "description": "Short description"
    }
  ]
}

CV:
${cvText}
`
          }
        ]
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        }
      }
    );

    const text = response.data.content[0].text;

    res.json({
      result: text
    });

  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: "AI analysis failed"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});