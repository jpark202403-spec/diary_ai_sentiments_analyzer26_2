import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

const analysisSchema = z.object({
  temperature: z.number().min(0).max(100).describe("총괄 감정 온도 (0 ~ 100도)"),
  temperatureDesc: z.string().describe("감정 온도 상태 설명 (예: '따뜻하고 매우 긍정적인 심리 상태', '차분하고 정돈된 내면 상태')"),
  confidence: z.number().min(80).max(100).describe("AI 분석 신뢰도 퍼센트 (85 ~ 99)"),
  deepAnalysis: z.string().describe("Gemini 심층 인지 분석. 작성자의 감정 흐름, 성취, 극복 등을 따뜻하고 섬세하게 통찰하는 2~4문장."),
  highlightKeywords: z.array(z.string()).describe("심층 분석 중 특별히 강조할 핵심 키워드 2~4개"),
  positiveRatio: z.number().min(0).max(100).describe("긍정 정서 비율 (%)"),
  neutralRatio: z.number().min(0).max(100).describe("중립 관조 비율 (%)"),
  negativeRatio: z.number().min(0).max(100).describe("일시 당면(불안/부정) 비율 (%)"),
  wordsCount: z.number().describe("분석된 주요 어휘 개수"),
  consolation: z.string().describe("Gemini가 건네는 한 줄 위로 (따뜻하고 진심어린 응원 한 마디)"),
  dominantEmotionKey: z.enum(["joy", "achievement", "peace", "sadness", "anger"]).describe("5개 감성 중 일기에서 가장 강하게 드러나 강조할 대표 감정 키"),
  spectrum: z.object({
    joy: z.object({
      name: z.string().default("감동 · 행복"),
      score: z.number().min(0).max(100),
      summary: z.string().describe("이 감정이 나타난 맥락 한 줄 설명"),
    }),
    achievement: z.object({
      name: z.string().default("자긍심 · 성취"),
      score: z.number().min(0).max(100),
      summary: z.string().describe("이 감정이 나타난 맥락 한 줄 설명"),
    }),
    peace: z.object({
      name: z.string().default("평온 · 여유"),
      score: z.number().min(0).max(100),
      summary: z.string().describe("이 감정이 나타난 맥락 한 줄 설명"),
    }),
    sadness: z.object({
      name: z.string().default("우울 · 외로움"),
      score: z.number().min(0).max(100),
      summary: z.string().describe("이 감정이 나타난 맥락 한 줄 설명"),
    }),
    anger: z.object({
      name: z.string().default("분노 · 답답"),
      score: z.number().min(0).max(100),
      summary: z.string().describe("이 감정이 나타난 맥락 한 줄 설명"),
    }),
  }),
});

export type DiaryAnalysisResult = z.infer<typeof analysisSchema>;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "일기 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY 환경 변수가 설정되지 않았습니다. .env.local에 API 키를 설정해주세요." },
        { status: 500 }
      );
    }

    // Gemini 3.8 Flash를 사용하여 구조화된 감정 분석 수행
    const result = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: analysisSchema,
      prompt: `
당신은 인간의 마음을 따뜻하고 깊이 있게 이해하는 인공지능 감성 상담가 'MindScribe AI' (Gemini 엔진)입니다.
사용자가 작성한 일기를 읽고 다층적인 감성 및 심리 분석을 수행해주세요.

[일기 내용]:
${content}

[분석 요구사항]:
1. 5개 감성 축:
   - joy: 감동 · 행복
   - achievement: 자긍심 · 성취
   - peace: 평온 · 여유
   - sadness: 우울 · 외로움
   - anger: 분노 · 답답
2. 5개 감성 중 일기의 핵심 줄기를 대표하는 단 하나의 대표 감정(dominantEmotionKey)을 선정하여 가장 높은 점수(score)를 부여하고 강조해주세요.
3. 총괄 감정 온도(0~100℃)를 매겨주세요.
4. Gemini 심층 인지 분석: 작성자의 감정 흐름을 따뜻하고 객관적으로 분석해주세요.
5. Gemini가 건네는 한 줄 위로: 마음에 오래 남을 수 있는 다정하고 진정성 있는 응원 문장을 지어주세요.
`,
    });

    return NextResponse.json(result.object);
  } catch (error: unknown) {
    console.error("Gemini Analysis API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "감정 분석 중 오류가 발생했습니다.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
