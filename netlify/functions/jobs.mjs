const jobs = [
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

const jsonHeaders = {
  "Cache-Control": "public, max-age=60",
  "Content-Type": "application/json",
};

export async function handler() {
  return {
    statusCode: 200,
    headers: jsonHeaders,
    body: JSON.stringify({
      success: true,
      data: jobs,
      message: "Lightweight job data delivered.",
      payloadHeaderSize: "less than 1KB",
    }),
  };
}
