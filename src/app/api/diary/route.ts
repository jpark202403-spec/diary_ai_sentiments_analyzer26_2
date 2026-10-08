import { NextRequest, NextResponse } from "next/server";

function getGoogleScriptUrl() {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
    process.env.GOOGLE_SCRIPT_URL ||
    ""
  ).trim();
}

async function safeFetchJson(url: string, options: RequestInit) {
  const res = await fetch(url, {
    ...options,
    redirect: "follow", // 구글 앱스 스크립트 302 리다이렉트 필수 처리
    cache: "no-store",
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // 만약 구글 인증창 HTML 등이 넘어온 경우
    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      throw new Error(
        "구글 앱스 스크립트가 HTML을 반환했습니다. 앱스 스크립트 배포 시 '액세스 권한이 있는 사용자'를 '모든 사용자(Anyone)'로 설정했는지 확인해주세요."
      );
    }
    throw new Error(`JSON 파싱 실패: ${text.slice(0, 100)}`);
  }
}

// [R] 일기 목록 조회
export async function GET(req: NextRequest) {
  try {
    const scriptUrl = getGoogleScriptUrl();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 설정이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timestamp = searchParams.get("timestamp");

    let url = `${scriptUrl}?action=read`;
    if (timestamp) {
      url += `&timestamp=${encodeURIComponent(timestamp)}`;
    }

    const data = await safeFetchJson(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Diary GET error:", error);
    const msg =
      error instanceof Error
        ? error.message
        : "일기 목록을 불러오는 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// [C] 일기 저장 (Create)
export async function POST(req: NextRequest) {
  try {
    const scriptUrl = getGoogleScriptUrl();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 설정이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { datetime, content, timestamp } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "일기 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const payload = {
      action: "create",
      timestamp: timestamp || Date.now(),
      datetime:
        datetime ||
        new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      content: content.trim(),
    };

    const data = await safeFetchJson(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // Apps Script doPost 호환
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Diary POST error:", error);
    const msg =
      error instanceof Error ? error.message : "일기 저장 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// [U] 일기 수정 (Update)
export async function PUT(req: NextRequest) {
  try {
    const scriptUrl = getGoogleScriptUrl();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 설정이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { timestamp, content, datetime } = body;

    if (!timestamp) {
      return NextResponse.json(
        { success: false, error: "수정 대상 timestamp가 필요합니다." },
        { status: 400 }
      );
    }

    const payload = {
      action: "update",
      timestamp,
      content,
      datetime,
    };

    const data = await safeFetchJson(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Diary PUT error:", error);
    const msg =
      error instanceof Error ? error.message : "일기 수정 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// [D] 일기 삭제 (Delete)
export async function DELETE(req: NextRequest) {
  try {
    const scriptUrl = getGoogleScriptUrl();
    if (!scriptUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            ".env.local 파일에 NEXT_PUBLIC_GOOGLE_SCRIPT_URL 설정이 필요합니다.",
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timestamp = searchParams.get("timestamp");

    if (!timestamp) {
      return NextResponse.json(
        { success: false, error: "삭제 대상 timestamp가 필요합니다." },
        { status: 400 }
      );
    }

    const payload = {
      action: "delete",
      timestamp,
    };

    const data = await safeFetchJson(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Diary DELETE error:", error);
    const msg =
      error instanceof Error ? error.message : "일기 삭제 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
