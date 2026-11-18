import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { FlashcardTerm, StudyStatus } from '../data/flashcards';

export type ReviewFilter = 'all' | 'unknown';

interface TermListPanelProps {
  categoryLabel: string;
  categoryDesc: string;
  terms: FlashcardTerm[];
  progressMap: Record<string, StudyStatus>;
  activeTermId: string | undefined;
  filter: ReviewFilter;
  onChangeFilter: (filter: ReviewFilter) => void;
  onSelectTerm: (termId: string) => void;
  onDeleteCustomTerm: (termId: string) => void;
  onResetCategory: () => void;
}

export function TermListPanel({
  categoryLabel,
  categoryDesc,
  terms,
  progressMap,
  activeTermId,
  filter,
  onChangeFilter,
  onSelectTerm,
  onDeleteCustomTerm,
  onResetCategory,
}: TermListPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const knownCount = terms.filter((t) => progressMap[t.id] === 'known').length;
  const unknownCount = terms.filter(
    (t) => progressMap[t.id] === 'unknown',
  ).length;
  const unseenCount = terms.length - knownCount - unknownCount;
  const hasAnyProgress = knownCount > 0 || unknownCount > 0;

  const knownPercent =
    terms.length > 0 ? Math.round((knownCount / terms.length) * 100) : 0;
  const unknownPercent =
    terms.length > 0 ? Math.round((unknownCount / terms.length) * 100) : 0;

  return (
    <section
      aria-label={`${categoryLabel} 학습 현황과 용어 목록`}
      className="rounded-3xl bg-white border border-[#1367c6] p-5 sm:p-6 shadow-[0_10px_30px_-15px_rgba(16,35,71,0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#102347]">
            {categoryLabel} 학습 현황
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">{categoryDesc}</p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-2xl font-bold text-[#102347] tabular-nums">
            {knownCount}
          </span>
          <span className="text-base font-semibold text-slate-400 tabular-nums">
            {' '}
            / {terms.length}
          </span>
        </div>
      </div>

      {/* 진행 막대 (남색=알아요, 주황=모르겠어요) */}
      <div
        className="mt-4 h-3 w-full rounded-full bg-slate-100 overflow-hidden flex"
        role="img"
        aria-label={`알아요 ${knownCount}개, 모르겠어요 ${unknownCount}개, 학습 전 ${unseenCount}개`}
      >
        {knownPercent > 0 && (
          <div
            className="h-full bg-[#102347] transition-all duration-300"
            style={{ width: `${knownPercent}%` }}
          />
        )}
        {unknownPercent > 0 && (
          <div
            className="h-full bg-[#EA580C] transition-all duration-300"
            style={{ width: `${unknownPercent}%` }}
          />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5 text-[#102347]">
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">알아요 {knownCount}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[#C2410C]">
          <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">모르겠어요 {unknownCount}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <Circle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">학습 전 {unseenCount}</span>
        </span>
      </div>

      {/* 필터 토글 */}
      <div className="mt-5 grid grid-cols-2 gap-1.5 rounded-2xl bg-[#F4F6FA] p-1.5">
        <button
          type="button"
          onClick={() => onChangeFilter('all')}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-[#102347] shadow-sm'
              : 'text-slate-600 hover:text-[#102347]'
          }`}
        >
          전체 보기 ({terms.length})
        </button>
        <button
          type="button"
          onClick={() => onChangeFilter('unknown')}
          className={`min-h-[44px] px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            filter === 'unknown'
              ? 'bg-[#EA580C] text-white shadow-sm'
              : 'text-slate-600 hover:text-[#C2410C]'
          }`}
        >
          모르겠어요만 ({unknownCount})
        </button>
      </div>

      {/* 용어 목록 */}
      <ul className="mt-4 divide-y divide-slate-100">
        {terms.map((item, idx) => {
          const itemStatus = progressMap[item.id] ?? 'unseen';
          const isActive = item.id === activeTermId;
          return (
            <li
              key={item.id}
              className={`my-1 rounded-2xl flex items-center gap-1 transition-colors ${
                isActive
                  ? 'bg-[#102347]/[0.06] ring-1 ring-[#102347]/25'
                  : 'hover:bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTerm(item.id)}
                className="flex-1 min-w-0 min-h-[58px] px-3.5 py-3 flex items-center justify-between gap-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold tabular-nums shrink-0 ${
                      isActive
                        ? 'bg-[#102347] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold text-[#102347] truncate">
                      {item.term}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 truncate">
                      {item.subTerm.trim() ? item.subTerm : '직접 추가한 용어'}
                      {item.isCustom && item.subTerm.trim() && ' · 직접 추가'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-sm font-semibold">
                  {itemStatus === 'known' && (
                    <span className="inline-flex items-center gap-1 text-[#102347]">
                      <CheckCircle2
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>알아요</span>
                    </span>
                  )}
                  {itemStatus === 'unknown' && (
                    <span className="inline-flex items-center gap-1 text-[#C2410C]">
                      <HelpCircle
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>모르겠어요</span>
                    </span>
                  )}
                  {itemStatus === 'unseen' && (
                    <span className="text-slate-400 font-medium">학습 전</span>
                  )}
                </div>
              </button>

              {item.isCustom && (
                <button
                  type="button"
                  onClick={() => onDeleteCustomTerm(item.id)}
                  aria-label={`${item.term} 삭제`}
                  title="직접 추가한 단어 삭제"
                  className="min-h-[44px] min-w-[44px] mr-1.5 rounded-xl text-slate-400 hover:text-[#C2410C] hover:bg-[#FFF3EB] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* 과목 기록 초기화 (브라우저 confirm 없이 인라인 확인) */}
      {hasAnyProgress && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="w-full min-h-[44px] rounded-xl text-sm font-semibold text-slate-500 hover:text-[#102347] hover:bg-slate-50 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{categoryLabel} 기록 초기화</span>
            </button>
          ) : (
            <div className="rounded-2xl bg-[#FFF6F0] border border-[#FFDCC7] p-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#102347]">
                이 과목 기록을 지울까요?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-[40px] px-3 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetCategory();
                    setConfirmReset(false);
                  }}
                  className="min-h-[40px] px-3 rounded-xl text-sm font-semibold text-white bg-[#EA580C] hover:bg-[#C2410C] cursor-pointer"
                >
                  초기화
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
