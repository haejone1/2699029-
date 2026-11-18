import { CheckCircle2, HelpCircle, RotateCw } from 'lucide-react';
import type { FlashcardTerm, StudyStatus } from '../data/flashcards';

interface FlashcardViewProps {
  card: FlashcardTerm;
  categoryLabel: string;
  currentIndex: number;
  totalCount: number;
  isFlipped: boolean;
  status: StudyStatus;
  onToggleFlip: () => void;
}

function renderHighlightedExample(example: string, term: string) {
  // Highlight exact term or base Korean words cleanly in bold navy
  const cleanTerm = term.trim();
  if (!cleanTerm || !example.includes(cleanTerm)) {
    return <span>{example}</span>;
  }
  const parts = example.split(cleanTerm);
  return (
    <>
      {parts.map((part, idx) => (
        <span key={idx}>
          {part}
          {idx < parts.length - 1 && (
            <strong className="font-bold text-[#102347] underline decoration-[#F26419]/60 decoration-2 underline-offset-4">
              {cleanTerm}
            </strong>
          )}
        </span>
      ))}
    </>
  );
}

function StatusText({ status, darkBg }: { status: StudyStatus; darkBg: boolean }) {
  if (status === 'unseen') {
    return (
      <span className={darkBg ? 'text-slate-300' : 'text-slate-500'}>
        학습 전
      </span>
    );
  }
  if (status === 'known') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold ${
          darkBg ? 'text-sky-200' : 'text-[#102347]'
        }`}
      >
        <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span>알아요</span>
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        darkBg ? 'text-[#FFB380]' : 'text-[#C2410C]'
      }`}
    >
      <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>모르겠어요</span>
    </span>
  );
}

export function FlashcardView({
  card,
  categoryLabel,
  currentIndex,
  totalCount,
  isFlipped,
  status,
  onToggleFlip,
}: FlashcardViewProps) {
  return (
    <div className="card-perspective w-full">
      <button
        type="button"
        onClick={onToggleFlip}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? `${card.term} 뒷면 뜻과 예문 보기 중. 누르면 앞면으로 돌아갑니다.`
            : `${card.term} 앞면. 누르면 뜻과 예문이 보입니다.`
        }
        className="group relative block w-full min-h-[340px] sm:min-h-[390px] text-left rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EA580C] cursor-pointer"
      >
        <div
          className={`card-inner w-full min-h-[340px] sm:min-h-[390px] ${
            isFlipped ? 'is-flipped' : ''
          }`}
        >
          {/* 앞면: 남색 둥근 카드 + 큰 글자 */}
          <div className="card-face rounded-3xl bg-[#102347] text-white p-6 sm:p-8 flex flex-col justify-between shadow-[0_18px_40px_-16px_rgba(16,35,71,0.45)]">
            <div className="flex items-center justify-between gap-4 text-sm sm:text-base font-medium">
              <div className="flex items-center gap-2 text-slate-300">
                <span>{categoryLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {currentIndex + 1} / {totalCount}
                </span>
              </div>
              <StatusText status={status} darkBg={true} />
            </div>

            <div className="my-auto py-6 text-center">
              <p className="text-xs sm:text-sm font-semibold tracking-wide text-[#FF9E64] mb-3">
                전공 핵심 용어
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight break-keep [text-wrap:balance]">
                {card.term}
              </h2>
              {card.subTerm.trim() && (
                <p className="mt-3 text-base sm:text-lg font-medium text-slate-300">
                  {card.subTerm}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-white/10 text-sm sm:text-base font-semibold text-[#FFB380] group-hover:text-[#FFD0B0] transition-colors">
              <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>카드를 누르면 뜻과 예문이 보여요</span>
            </div>
          </div>

          {/* 뒷면: 밝은 흰색 둥근 카드 + 뜻과 예문 */}
          <div className="card-face card-face-back rounded-3xl bg-white text-[#102347] border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between shadow-[0_18px_40px_-16px_rgba(16,35,71,0.16)]">
            <div className="flex items-center justify-between gap-4 text-sm sm:text-base font-medium">
              <div className="flex items-center gap-2 text-slate-500 min-w-0">
                <span className="font-bold text-[#102347] truncate">
                  {card.term}
                </span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">뜻과 예문</span>
              </div>
              <StatusText status={status} darkBg={false} />
            </div>

            <div className="my-auto py-4 space-y-5">
              <div>
                <p className="text-xs sm:text-sm font-bold text-[#102347]/70 mb-1.5">
                  용어 뜻
                </p>
                <p className="text-xl sm:text-2xl font-bold leading-snug text-[#102347] break-keep">
                  {card.meaning}
                </p>
              </div>

              {card.example.trim() && (
                <div className="rounded-2xl bg-[#FFF6F0] border border-[#FFDCC7] p-4 sm:p-5">
                  <p className="text-xs sm:text-sm font-bold text-[#C2410C] mb-1.5">
                    실전 예문
                  </p>
                  <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-800 break-keep">
                    {renderHighlightedExample(card.example, card.term)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100 text-sm font-medium text-slate-500 group-hover:text-[#102347] transition-colors">
              <RotateCw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>다시 누르면 앞면으로 돌아갑니다</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
