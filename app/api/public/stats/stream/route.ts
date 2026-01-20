import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// In-memory cache shared across all SSE connections
let cachedStats = { totalRegistrations: 0, checkedIn: 0, timestamp: "" };
let lastFetch = 0;

async function getStats() {
  const now = Date.now();

  // Return cached stats if fetched within last 2 seconds
  // This prevents 100 concurrent SSE connections from each hitting the DB
  if (now - lastFetch < 2000 && cachedStats.timestamp) {
    return cachedStats;
  }

  const [totalRegistrations, checkedIn] = await Promise.all([
    db.registration.count(),
    db.registration.count({ where: { status: "CHECKED_IN" } }),
  ]);

  cachedStats = {
    totalRegistrations,
    checkedIn,
    timestamp: new Date().toISOString(),
  };
  lastFetch = now;

  return cachedStats;
}

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      try {
        const initialStats = await getStats();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(initialStats)}\n\n`)
        );
      } catch (error) {
        console.error("Error fetching initial stats:", error);
      }

      // Poll database and push updates every 3 seconds
      intervalId = setInterval(async () => {
        if (isClosed) {
          if (intervalId) clearInterval(intervalId);
          return;
        }

        try {
          const stats = await getStats();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(stats)}\n\n`)
          );
        } catch (error) {
          // Silently handle - connection likely closed
          if (intervalId) clearInterval(intervalId);
        }
      }, 3000);
    },
    cancel() {
      isClosed = true;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
