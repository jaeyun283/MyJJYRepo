import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json(
    {
      account: {
        configured: !!(
          process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ),
        connected: false,
      },
      ai: { configured: !!process.env.GEMINI_API_KEY, connected: false },
      drive: {
        configured: !!(
          process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ),
        connected: false,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
