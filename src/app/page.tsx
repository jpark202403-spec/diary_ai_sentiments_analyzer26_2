"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Heart,
  SlidersHorizontal,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
  Save,
  BookOpen,
  Trash2,
  X,
  RefreshCw,
  Clock,
  Check,
} from "lucide-react";
import type { DiaryAnalysisResult } from "./api/analyze/route";

interface SheetDiaryEntry {
  timestamp: string | number;
  datetime: string;
  content: string;
}

export default function DiaryAnalyzerPage() {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<DiaryAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedEmotionTab, setSelectedEmotionTab] = useState<string | null>(null);
  const [formattedDateTime, setFormattedDateTime] = useState({
    dateStr: "",
    dayStr: "",
    timeStr: "",
  });

  // 구글 시트 관련 상태
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [diaryList, setDiaryList] = useState<SheetDiaryEntry[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // 실시간 날짜, 요일, 시간 표시
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const day = days[now.getDay()];

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "오후" : "오전";
      hours = hours % 12;
      hours = hours ? hours : 12;

      setFormattedDateTime({
        dateStr: `${year}년 ${month}월 ${date}일`,
        dayStr: day,
        timeStr: `${ampm} ${hours}:${minutes}`,
      });
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // [저장] 버튼 핸들러: Google Apps Script를 통해 구글 시트에 일기 저장
  const handleSaveDiary = async () => {
    if (!content.trim()) {
      alert("저장할 일기 내용을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const datetimeFormatted = `${formattedDateTime.dateStr} (${formattedDateTime.dayStr}) ${formattedDateTime.timeStr}`;
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datetime: datetimeFormatted,
          content: content.trim(),
          timestamp: Date.now(),
        }),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        throw new Error(result.error || "구글 시트 저장에 실패했습니다.");
      }

      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 3000);
      alert("일기가 구글 시트에 안전하게 저장되었습니다!");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "일기 저장 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // [일기보기] 버튼 핸들러: 구글 시트 저장 목록 불러오기
  const fetchDiaryList = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch("/api/diary", {
        method: "GET",
        headers: { "Accept": "application/json" },
      });

      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || "일기 목록을 가져오지 못했습니다.");
      }

      setDiaryList(Array.isArray(result.data) ? result.data : []);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "일기 목록 불러오기 실패";
      alert(msg);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleOpenDiaryList = () => {
    setIsListModalOpen(true);
    fetchDiaryList();
  };

  // 일기 목록에서 특정 일기 선택하여 에디터로 불러오기
  const handleSelectDiary = (entry: SheetDiaryEntry) => {
    if (content.trim() && content !== entry.content) {
      if (!confirm("현재 작성 중인 일기 내용이 선택한 일기로 변경됩니다. 계속하시겠습니까?")) {
        return;
      }
    }
    setContent(entry.content);
    setIsListModalOpen(false);
  };

  // 일기 삭제 핸들러 (Delete)
  const handleDeleteDiary = async (timestamp: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 일기를 구글 시트에서 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(timestamp);
    try {
      const res = await fetch(`/api/diary?timestamp=${encodeURIComponent(timestamp)}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (!res.ok || result.success === false) {
        throw new Error(result.error || "일기 삭제에 실패했습니다.");
      }

      // 목록에서 즉시 제거
      setDiaryList((prev) => prev.filter((item) => String(item.timestamp) !== String(timestamp)));
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "일기 삭제 중 오류가 발생했습니다.";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // AI 분석 실행 핸들러
  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert("일기 내용을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "분석 요청에 실패했습니다.");
      }

      setAnalysis(data);
      setSelectedEmotionTab(data.dominantEmotionKey);
    } catch (error: unknown) {
      console.error(error);
      const msg = error instanceof Error ? error.message : "분석 도중 오류가 발생했습니다.";
      setErrorMessage(msg);
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 재시작 (일기 작성 및 분석 결과 초기화)
  const handleReset = () => {
    if (confirm("일기 작성 내용을 초기화하고 다시 시작하시겠습니까?")) {
      setContent("");
      setAnalysis(null);
      setSelectedEmotionTab(null);
      setErrorMessage(null);
    }
  };

  // 5개 감성 정의
  const emotionConfig = [
    { key: "joy" as const, name: "감동 · 행복", icon: "💛" },
    { key: "achievement" as const, name: "자긍심 · 성취", icon: "✨" },
    { key: "peace" as const, name: "평온 · 여유", icon: "🍃" },
    { key: "sadness" as const, name: "우울 · 외로움", icon: "🌧️" },
    { key: "anger" as const, name: "분노 · 답답", icon: "🔥" },
  ];

  const wordCount = content.trim().length;

  return (
    <div className="min-h-screen bg-[#F7F5FA] text-[#221E2A] flex flex-col">
      {/* 1. 상단 글로벌 네비게이션 헤더 */}
      <header className="border-b border-[#EAE4F2] bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-xl md:text-2xl tracking-tight text-[#221E2A]">
              AI 일기 감성 분석
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 3.8 Flash 연결됨</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. 서브 헤더 (날짜 & 요일 & 시간 표시 + 컨트롤 버튼) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* 일기 작성 날짜에 요일과 시간도 함께 표시 */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#7D768E]">
              <span>일기장</span>
              <span>/</span>
              <span>{formattedDateTime.dateStr.slice(0, 8)}</span>
              <span>/</span>
              <span className="font-bold text-[#221E2A] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#6356E5]" />
                {formattedDateTime.dateStr} 일기 • {formattedDateTime.dayStr} {formattedDateTime.timeStr}
                <span className="w-1.5 h-1.5 rounded-full bg-[#6356E5]" />
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-[#8A849B]">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                자동 동기화 완료
              </span>
              <span>•</span>
              <span>현재 시각 기준 기록 중</span>
            </div>
          </div>

          {/* 주요 컨트롤 액션 버튼 그룹 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 재시작 버튼 */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-[#DDD6E8] text-xs font-semibold text-[#574E6B] hover:bg-[#F5EFFB] hover:text-[#93000A] transition shadow-xs group cursor-pointer"
              title="일기 작성 내용을 초기화하고 다시 시작합니다"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#726A85] group-hover:rotate-[-45deg] transition-transform" />
              재시작
            </button>

            {/* AI 분석 시작 버튼 */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !content.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#5343DE] to-[#6C5CE7] hover:from-[#4736CF] hover:to-[#5E4DE0] text-white text-xs font-bold shadow-md shadow-[#6356E5]/30 hover:shadow-lg hover:shadow-[#6356E5]/40 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini 감성 분석 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <div className="flex flex-col text-left leading-tight">
                    <span>분석 시작</span>
                    <span className="text-[10px] font-normal text-indigo-100">Gemini 3.8 Flash</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}
      </section>

      {/* 3. 본문 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 w-full flex-1">
        <div
          className={`grid gap-6 items-start transition-all duration-500 ${
            analysis ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1 max-w-4xl mx-auto"
          }`}
        >
          {/* ===================== [일기 작성 영역] ===================== */}
          <div
            className={`rounded-3xl p-6 md:p-8 bg-white border border-[#E8E1F0] shadow-sm hover:shadow-md transition-all duration-300 ${
              analysis ? "lg:col-span-6" : "w-full"
            }`}
          >
            {/* 에디터 상단 헤더 */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAF5]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#F0ECFC] flex items-center justify-center text-[#6356E5]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold tracking-tight">오늘의 기록 에디터</h2>
              </div>

              {/* 오른쪽 상단 액션: [저장] 버튼 및 [일기보기] 버튼 */}
              <div className="flex items-center gap-2">
                {/* [저장] 버튼 */}
                <button
                  type="button"
                  onClick={handleSaveDiary}
                  disabled={isSaving || !content.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6356E5] hover:bg-[#5343DE] text-white text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="구글 시트에 일기 저장"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>저장 중...</span>
                    </>
                  ) : saveSuccessNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>저장됨</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>저장</span>
                    </>
                  )}
                </button>

                {/* [일기보기] 버튼: 저장 버튼 오른쪽 */}
                <button
                  type="button"
                  onClick={handleOpenDiaryList}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F0ECFC] hover:bg-[#E4DDFE] text-[#5547D6] text-xs font-semibold transition border border-[#DCD3FC] shadow-2xs cursor-pointer active:scale-95"
                  title="구글 시트에 저장된 일기 목록 보기"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>일기보기</span>
                </button>
              </div>
            </div>

            {/* 일기 본문 입력 */}
            <div className="mt-4 min-h-[320px] flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 하루 어떤 일들이 있었나요? 그 순간 마음에 머물렀던 감정을 솔직하게 적어보세요..."
                rows={13}
                className="w-full flex-1 bg-transparent border-none outline-none resize-none leading-relaxed placeholder-[#ABA4BA] text-sm md:text-base focus:ring-0"
              />
            </div>

            {/* 에디터 하단 툴바 */}
            <div className="pt-4 border-t border-[#F0EAF5] flex items-center justify-between text-xs text-[#7B748C]">
              <span className="text-[#88819A]">
                솔직한 감정 기록은 내면의 회복탄력성을 높여줍니다.
              </span>
              <div>
                <span className="font-semibold text-[#3E384D]">{wordCount}</span>자 작성됨
              </div>
            </div>
          </div>

          {/* ===================== [AI 일기 감성 분석 결과 영역] ===================== */}
          {analysis && (
            <div className="lg:col-span-6 rounded-3xl p-6 md:p-8 bg-white border border-[#E8E1F0] shadow-sm hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 리포트 상단 헤더 */}
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAF5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ECE7FE] flex items-center justify-center text-[#5547D6]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight">감정 진단 리포트</h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#787187]">
                      <span>Gemini 3.8 Flash Engine</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5547D6] animate-pulse" />
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-[#F0ECFD] text-[#5547D6] text-xs font-bold border border-[#DCD3FC]">
                  신뢰도 {analysis.confidence}%
                </div>
              </div>

              {/* 총괄 감정 온도계 */}
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[#FAF8FD] to-[#F3EEFA] border border-[#E9E1F2]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5B546A]">
                    <span>🌡️</span>
                    <span>총괄 감정 온도계</span>
                  </div>
                  <div className="text-2xl font-black text-[#5547D6] tracking-tight">
                    {analysis.temperature}
                    <span className="text-base font-semibold text-[#7E7790] ml-0.5">℃</span>
                  </div>
                </div>

                <div className="mt-3 relative h-3 rounded-full bg-[#E5DDEE] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-[#6356E5] to-amber-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, analysis.temperature))}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-[#7D768E]">
                  <span>차분함 (36.5℃)</span>
                  <span className="font-bold text-[#5547D6]">{analysis.temperatureDesc}</span>
                  <span>열광 (100℃)</span>
                </div>
              </div>

              {/* Gemini 심층 인지 분석 코멘트 */}
              <div className="mt-5 p-5 rounded-2xl bg-[#F7F4FC] border border-[#E7DFEF]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5547D6] mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini 심층 인지 분석</span>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-[#3B3549] font-normal">
                  {analysis.deepAnalysis}
                </p>
              </div>

              {/* 감정 분포 통계 */}
              <div className="mt-5 p-5 rounded-2xl bg-white border border-[#EAE3F2] shadow-2xs">
                <div className="flex items-center justify-between text-xs font-semibold text-[#5A546A] mb-2.5">
                  <span>감정 분포 통계</span>
                  <span className="text-[11px] font-normal text-[#8A8398]">
                    어휘 {analysis.wordsCount}개 분석 기준
                  </span>
                </div>

                <div className="h-2.5 rounded-full overflow-hidden flex bg-gray-100">
                  <div
                    className="bg-[#6356E5] transition-all duration-500"
                    style={{ width: `${analysis.positiveRatio}%` }}
                    title={`긍정 ${analysis.positiveRatio}%`}
                  />
                  <div
                    className="bg-[#C5BDEB] transition-all duration-500"
                    style={{ width: `${analysis.neutralRatio}%` }}
                    title={`중립 ${analysis.neutralRatio}%`}
                  />
                  <div
                    className="bg-rose-300 transition-all duration-500"
                    style={{ width: `${analysis.negativeRatio}%` }}
                    title={`일시 당면 ${analysis.negativeRatio}%`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-[#F4F0FC] border border-[#E9E1F6]">
                    <div className="text-sm font-bold text-[#5547D6]">{analysis.positiveRatio}%</div>
                    <div className="text-[10px] text-[#746C86] font-medium mt-0.5">긍정 정서</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F6F5F8] border border-[#ECE9F0]">
                    <div className="text-sm font-bold text-[#5F596D]">{analysis.neutralRatio}%</div>
                    <div className="text-[10px] text-[#746C86] font-medium mt-0.5">중립 관조</div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#FFF1F2] border border-[#FFE0E3]">
                    <div className="text-sm font-bold text-rose-600">{analysis.negativeRatio}%</div>
                    <div className="text-[10px] text-[#866C70] font-medium mt-0.5">일시 당면</div>
                  </div>
                </div>
              </div>

              {/* GEMINI가 건네는 한 줄 위로 */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-[#EDE8FE] to-[#F7EEFB] border border-[#DDD3F8] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6356E5] shadow-xs shrink-0">
                  <Heart className="w-4 h-4 fill-[#6356E5]/20 text-[#6356E5]" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-[#6356E5] uppercase tracking-wider">
                    GEMINI가 건네는 한 줄 위로
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-[#29223A] mt-0.5">
                    &ldquo;{analysis.consolation}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===================== [감성 이모지 영역 / 감정 스펙트럼 분석] ===================== */}
        {analysis && (
          <section className="mt-8 rounded-3xl bg-white border border-[#E8E1F0] p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-[#F0EAF5]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F3EFFB] flex items-center justify-center text-[#6356E5]">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight">감정 스펙트럼 분석</h3>
                  <p className="text-xs text-[#7B748C]">
                    Gemini가 일기에서 분석한 5가지 감성의 강도와 맥락입니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
              {emotionConfig.map((item) => {
                const emotionData = analysis.spectrum[item.key];
                const isDominant = analysis.dominantEmotionKey === item.key;
                const isSelected = selectedEmotionTab === item.key;

                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedEmotionTab(item.key)}
                    className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between ${
                      isDominant
                        ? "bg-gradient-to-b from-[#FAF8FE] to-[#F1EDFD] border-2 border-[#6356E5] shadow-lg shadow-indigo-100 ring-2 ring-[#6356E5]/20 scale-[1.02]"
                        : isSelected
                        ? "bg-white border-2 border-[#8E7BF0] shadow-md"
                        : "bg-[#FAFAFD] hover:bg-white border border-[#ECE6F2] hover:shadow-md"
                    }`}
                  >
                    {isDominant && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#6356E5] text-white text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap">
                        <span>★</span>
                        <span>오늘의 대표 감정</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        <span
                          className={`text-2xl font-black tracking-tight ${
                            isDominant ? "text-[#5547D6]" : "text-[#5B556C]"
                          }`}
                        >
                          {emotionData.score}%
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold mt-3 ${
                          isDominant ? "text-[#3F33A8]" : "text-[#282236]"
                        }`}
                      >
                        {item.name}
                      </h4>

                      <p className="text-[11px] leading-relaxed text-[#756D84] mt-1.5 line-clamp-2">
                        {emotionData.summary}
                      </p>
                    </div>

                    {isDominant ? (
                      <div className="mt-4 pt-3 border-t border-[#DFD7F2] flex items-center justify-between text-xs font-bold text-[#5547D6]">
                        <span>대표 감정 확인</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="mt-4 pt-3 border-t border-transparent text-[11px] text-[#A59EAF] font-medium">
                        감정 비율
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* 4. [일기보기] 모달 다이얼로그 */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E8E1F0] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="p-5 border-b border-[#F0EAF5] flex items-center justify-between bg-[#FAF8FD]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#EDE7FD] flex items-center justify-center text-[#6356E5]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#221E2A]">구글 시트 저장 일기 목록</h3>
                  <p className="text-xs text-[#7B748C]">
                    선택하면 본문으로 불러오며, 즉시 AI 감정 분석이 가능합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchDiaryList}
                  disabled={isLoadingList}
                  className="p-2 rounded-xl text-[#6E677F] hover:bg-[#EFE9F7] transition cursor-pointer"
                  title="목록 새로고침"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingList ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsListModalOpen(false)}
                  className="p-2 rounded-xl text-[#6E677F] hover:bg-[#EFE9F7] transition cursor-pointer"
                  title="닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 모달 바디: 일기 목록 */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {isLoadingList ? (
                <div className="py-16 text-center text-[#7B748C]">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#6356E5] mb-2" />
                  <p className="text-xs">구글 시트에서 일기를 불러오는 중입니다...</p>
                </div>
              ) : diaryList.length === 0 ? (
                <div className="py-16 text-center text-[#8C859B]">
                  <BookOpen className="w-10 h-10 mx-auto text-[#DDD6E8] mb-2" />
                  <p className="text-sm font-semibold text-[#4F475F]">저장된 일기가 없습니다.</p>
                  <p className="text-xs text-[#9B94A9] mt-1">
                    새 일기를 작성하고 [저장] 버튼을 눌러보세요.
                  </p>
                </div>
              ) : (
                diaryList.map((entry) => (
                  <div
                    key={String(entry.timestamp)}
                    onClick={() => handleSelectDiary(entry)}
                    className="p-4 rounded-2xl border border-[#ECE6F3] bg-[#FAFAFE] hover:bg-[#F4EFFC] hover:border-[#D5CAFC] transition-all cursor-pointer flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-[#6356E5] font-semibold mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{entry.datetime || "일시 미기재"}</span>
                      </div>
                      <p className="text-xs md:text-sm text-[#2D2838] line-clamp-3 leading-relaxed">
                        {entry.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-center">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteDiary(entry.timestamp, e)}
                        disabled={deletingId === entry.timestamp}
                        className="p-2 rounded-xl text-[#9A91A8] hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="이 일기 삭제"
                      >
                        {deletingId === entry.timestamp ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="p-4 border-t border-[#F0EAF5] bg-[#FAF8FD] flex items-center justify-between text-xs text-[#7B748C]">
              <span>총 {diaryList.length}건의 기록</span>
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white border border-[#DCD3FC] text-[#5547D6] font-semibold hover:bg-[#F2EDFD] transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 세련되게 디자인된 하단 푸터 */}
      <footer className="mt-16 border-t border-[#EAE3F2] bg-white/80 backdrop-blur-sm relative overflow-hidden">
        {/* 상단 포인트 그라데이션 바 */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#6356E5]/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* 좌측: 서비스 아이덴티티 */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#5547D6] to-[#7B68EE] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-sm tracking-tight text-[#221E2A]">
                  Diary AI Sentiments Analyzer
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECE7FE] text-[#5547D6]">
                  v3.8
                </span>
              </div>
              <p className="text-xs text-[#7B748C]">
                인공지능 기반 텍스트 감성 분석과 마음 챙김을 위한 스마트 저널링 플랫폼
              </p>
            </div>

            {/* 우측: 뱃지 및 기술 정보 */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFFB] border border-[#E3DCED] text-xs font-medium text-[#574E6A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6356E5] animate-pulse" />
                <span>Powered by Gemini 3.8 Flash</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F3F7] border border-[#E3DEEA] text-xs font-medium text-[#655E75]">
                <span>Google Sheets Sync</span>
              </div>
            </div>
          </div>

          {/* 하단 구분선 및 저작권 표시 */}
          <div className="mt-6 pt-6 border-t border-[#F0EAF5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8A8398]">
            <p className="font-medium tracking-tight text-[#5A5369]">
              Copyright INU Diary AI Sentiments Analyzer by kyonam Choo
            </p>
            <p className="text-[11px] text-[#A59EB2]">
              All rights reserved. Designed with Warm M3 Mindspace.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
