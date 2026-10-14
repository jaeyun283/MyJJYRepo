import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.consent)
      return NextResponse.json(
        { message: "전송할 질문과 자료를 확인하고 동의해 주세요." },
        { status: 400 },
      );
    if (
      typeof body.question !== "string" ||
      !body.question.trim() ||
      body.question.length > 4000
    )
      return NextResponse.json(
        { message: "질문은 1~4,000자로 작성해 주세요." },
        { status: 400 },
      );
    return NextResponse.json(
      {
        message: process.env.GEMINI_API_KEY
          ? "서버 키 설정은 감지되었지만 계정 권한·Gemini 상담 연동이 아직 준비되지 않았습니다. 질문은 외부로 전송하지 않았습니다."
          : "Gemini 서버 연결이 필요합니다. 질문과 자료는 외부 AI에 전송하지 않았습니다.",
      },
      { status: 503 },
    );
  } catch {
    return NextResponse.json(
      { message: "요청 내용을 읽을 수 없습니다." },
      { status: 400 },
    );
  }
}
