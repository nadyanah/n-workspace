import { GoogleGenAI, Type } from "@google/genai";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-load Gemini integration so it doesn't crash on startup if key is missing
let ai: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in the AI Studio environment variables/secrets.");
    }
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

// API endpoint to generate tailored interview questions based on current modern trends
app.post("/api/interview/generate", async (req, res) => {
  try {
    const { position, type } = req.body;
    if (!position) {
      return res.status(400).json({ error: "Kolom Posisi/Peran target perlu ditentukan!" });
    }

    const client = getGemini();

    const systemPrompt = `Buatkan tepat 3 (tiga) daftar pertanyaan wawancara kerja berbahasa Indonesia yang paling relevan, kekinian, realistis, dan berbobot spesifik untuk posisi: "${position}".
Tipe pertanyaan yang diminta: "${type}" (bisa berupa "General HR" yang menekankan cultural fit, soft-skills & attitude, ATAU "Spesifik/Mendalam" yang mendalam ke arah peran posisi tersebut, seperti tantangan modern, strategi taktis, skenario pemecahan masalah, atau technicality).

Kembalikan respon dalam format JSON ARRAY yang valid. Setiap objek di dalam array HARUS memiliki properti PERSIS seperti berikut:
- "text": Kalimat pertanyaan wawancara tertulis dalam Bahasa Indonesia yang berbobot.
- "hints": Saran taktis singkat atau petunjuk kerangka jawaban (STAR atau PREP atau PPF) dalam Bahasa Indonesia.
- "category": Kategori pertanyaan ini (Isi dengan "General HR" atau "${position}").

Balasan HARUS HANYA berupa JSON Array yang valid secara langsung (tanpa markdown block, tanpa awalan/akhiran obrolan lain) agar dapat langsung di-parse oleh JSON.parse().`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              hints: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ["text", "hints", "category"]
          }
        }
      }
    });

    const rawResponse = response.text ? response.text.trim() : "[]";
    const questions = JSON.parse(rawResponse);
    return res.json({ questions });
  } catch (err: any) {
    console.error("Kesalahan saat generate pertanyaan:", err);
    return res.status(500).json({ error: err.message || "Terdapat kendala server saat menghubungi Gemini API." });
  }
});

// Vite server bootstrapper
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is up and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
