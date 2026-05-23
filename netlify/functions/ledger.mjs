export async function handler() {
  return {
    statusCode: 200,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      ledger: [],
      serverLedgerEnabled: false,
    }),
  };
}
