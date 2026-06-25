export const dynamic = 'force-dynamic';

export async function GET(request) {
  const renderApiUrl = process.env.RENDER_API_URL;
  const timestamp = new Date().toISOString();

  if (!renderApiUrl) {
    console.error("CRON ERROR: RENDER_API_URL environment variable is not defined.");
    return Response.json(
      {
        success: false,
        error: "RENDER_API_URL environment variable is not set",
        timestamp
      },
      { status: 500 }
    );
  }

  try {
    const healthUrl = `${renderApiUrl.replace(/\/+$/, '')}/api/health`;
    console.log(`[Cron] Pinging health endpoint: ${healthUrl}`);

    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(`[Cron] Health check failed with status: ${response.status}`);
      return Response.json(
        {
          success: false,
          status: response.status,
          statusText: response.statusText,
          timestamp
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Cron] Health check succeeded:`, data);

    return Response.json({
      success: true,
      data,
      timestamp
    });
  } catch (error) {
    console.error("[Cron] Health check error:", error);

    const isTimeout = error.name === 'TimeoutError' || error.message?.includes('timeout') || error.name === 'AbortError';

    return Response.json(
      {
        success: false,
        error: isTimeout ? "Request timed out after 5000ms" : error.message,
        timestamp
      },
      { status: isTimeout ? 504 : 500 }
    );
  }
}
