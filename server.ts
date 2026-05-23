import express from "express";
import fs from "fs/promises";
import { createServer as createHttpServer, type Server as HttpServer } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";

interface MicroJob {
  id: string;
  type: "translation" | "annotation" | "transcribe";
  reward: string;
  payload: string;
  hindTask: string;
  dataSizeKb: number;
}

const DATABASE_JOBS: MicroJob[] = [
  {
    id: "job-101",
    type: "translation",
    reward: "Rs 15",
    payload: "Review customer service message: 'Please return the parcel instantly.'",
    hindTask: "Translate this customer message into simple Hindi.",
    dataSizeKb: 0.15,
  },
  {
    id: "job-102",
    type: "annotation",
    reward: "Rs 25",
    payload: "Key coordinates detected: (X:82, Y:41). Is the index finger pinching?",
    hindTask: "Confirm the pointer status. Is the finger pinching? Answer yes or no.",
    dataSizeKb: 0.2,
  },
  {
    id: "job-103",
    type: "transcribe",
    reward: "Rs 40",
    payload: "Audio sound: 'Chai garam aur samose ready hain, jaldi aao'.",
    hindTask: "Type the given audio line clearly.",
    dataSizeKb: 0.25,
  },
  {
    id: "job-104",
    type: "translation",
    reward: "Rs 30",
    payload: "Translate: 'Low bandwidth modes help save limited internet packs.'",
    hindTask: "Translate this sentence into simple Hindi.",
    dataSizeKb: 0.18,
  },
];

interface CompletedSubmission {
  jobId: string;
  answer: string;
  workerName: string;
  timestamp: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const SUBMISSIONS_FILE = path.join(DATA_DIR, "submissions.json");
const ENABLE_SERVER_LEDGER = process.env.ENABLE_SERVER_LEDGER === "true";

let completedSubmissions: CompletedSubmission[] = [];

async function loadSubmissions() {
  if (!ENABLE_SERVER_LEDGER) {
    completedSubmissions = [];
    return;
  }

  try {
    const data = await fs.readFile(SUBMISSIONS_FILE, "utf8");
    const parsed = JSON.parse(data);
    completedSubmissions = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.warn("Unable to load saved submissions. Starting with an empty ledger.", error);
    }
    completedSubmissions = [];
  }
}

async function saveSubmissions() {
  if (!ENABLE_SERVER_LEDGER) return;

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(completedSubmissions, null, 2));
}

function listenOnPort(server: HttpServer, port: number) {
  return new Promise<number>((resolve, reject) => {
    const cleanup = () => {
      server.off("error", onError);
      server.off("listening", onListening);
    };
    const onError = (error: NodeJS.ErrnoException) => {
      cleanup();
      reject(error);
    };
    const onListening = () => {
      cleanup();
      resolve(port);
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, "0.0.0.0");
  });
}

async function listenWithFallback(server: HttpServer, preferredPort: number) {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const port = preferredPort + attempt;

    try {
      return await listenOnPort(server, port);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EADDRINUSE" || attempt === maxAttempts - 1) {
        throw error;
      }

      console.warn(`Port ${port} is already in use. Trying ${port + 1}...`);
    }
  }

  throw new Error(`No available port found from ${preferredPort} to ${preferredPort + maxAttempts - 1}.`);
}

async function startServer() {
  await loadSubmissions();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const httpServer = createHttpServer(app);

  app.use(express.json());

  app.get("/api/jobs", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json({
      success: true,
      data: DATABASE_JOBS,
      message: "Lightweight job data delivered.",
      payloadHeaderSize: "less than 1KB",
    });
  });

  app.post("/api/submit", async (req, res) => {
    const { jobId, answer, workerName } = req.body;

    if (typeof jobId !== "string" || typeof answer !== "string" || !jobId.trim() || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer and Job ID are required.",
      });
    }

    const submission = {
      jobId: jobId.trim(),
      answer: answer.trim(),
      workerName: typeof workerName === "string" && workerName.trim() ? workerName.trim() : "Worker",
      timestamp: new Date().toISOString(),
    };

    if (ENABLE_SERVER_LEDGER) {
      completedSubmissions.push(submission);

      try {
        await saveSubmissions();
      } catch (error) {
        console.error("Unable to persist submission.", error);
        return res.status(500).json({
          success: false,
          message: "Submission received but could not be saved.",
        });
      }
    }

    res.json({
      success: true,
      message: ENABLE_SERVER_LEDGER ? "Submission saved successfully." : "Submission checked locally. Server storage is off.",
      earnedReward: DATABASE_JOBS.find((job) => job.id === jobId)?.reward || "Rs 10",
      totalLeaderboardCount: completedSubmissions.length,
      serverLedgerEnabled: ENABLE_SERVER_LEDGER,
    });
  });

  app.get("/api/ledger", (_req, res) => {
    res.json({
      success: true,
      ledger: completedSubmissions,
    });
  });

  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      if (!req.path.startsWith("/api/")) {
        res.setHeader("Cache-Control", "no-store");
      }
      next();
    });

    app.get("/sw.js", (_req, res) => {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Cache-Control", "no-store");
      res.send(`
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => self.clients.matchAll()).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});
`);
    });

    app.get("/__reset-4s", (_req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-store");
      res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Reset 4S</title>
  </head>
  <body>
    <p>Resetting 4S browser cache...</p>
    <script>
      async function reset() {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
        location.replace("/");
      }
      reset();
    </script>
  </body>
</html>`);
    });

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const activePort = await listenWithFallback(httpServer, PORT);
  console.log(`4S server listening on port ${activePort}`);
}

startServer();
