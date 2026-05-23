const jobs = [
  { id: "job-101", reward: "Rs 15" },
  { id: "job-102", reward: "Rs 25" },
  { id: "job-103", reward: "Rs 40" },
  { id: "job-104", reward: "Rs 30" },
];

const jsonHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json",
};

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: false,
        message: "Use POST to submit work.",
      }),
    };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: false,
        message: "Invalid JSON body.",
      }),
    };
  }

  const jobId = typeof body.jobId === "string" ? body.jobId.trim() : "";
  const answer = typeof body.answer === "string" ? body.answer.trim() : "";
  if (!jobId || !answer) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({
        success: false,
        message: "Answer and Job ID are required.",
      }),
    };
  }

  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({
      success: true,
      message: "Submission checked locally. Server storage is off.",
      earnedReward: jobs.find((job) => job.id === jobId)?.reward || "Rs 10",
      totalLeaderboardCount: 0,
      serverLedgerEnabled: false,
    }),
  };
}
