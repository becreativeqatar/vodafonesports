import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalRegistrations, checkedIn] = await Promise.all([
    db.registration.count(),
    db.registration.count({ where: { status: "CHECKED_IN" } }),
  ]);

  return {
    totalRegistrations,
    checkedIn,
    timestamp: new Date().toISOString(),
  };
}

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial data
      const initialStats = await getStats();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialStats)}\n\n`)
      );

      // Poll database and push updates every 2 seconds
      const interval = setInterval(async () => {
        try {
          const stats = await getStats();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(stats)}\n\n`)
          );
        } catch (error) {
          console.error("Error fetching stats for SSE:", error);
        }
      }, 2000);

      // Cleanup on close
      const cleanup = () => {
        clearInterval(interval);
      };

      // Handle client disconnect
      return cleanup;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
