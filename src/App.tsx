import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Plus,
  RotateCw,
} from 'lucide-react';
import {
  CATEGORIES,
  FLASHCARD_TERMS,
  type CategoryId,
  type FlashcardTerm,
  type StudyStatus,
} from './data/flashcards';
import { FlashcardView } from './components/FlashcardView';
import { TermListPanel, type ReviewFilter } from './components/TermListPanel';
import { AddTermModal, type NewTermInput } from './components/AddTermModal';

const STORAGE_KEY = 'major_flashcard_progress_v1';
const CUSTOM_TERMS_STORAGE_KEY = 'major_flashcard_custom_terms_v1';

function loadSavedProgress(): Record<string, StudyStatus> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const clean: Record<string, StudyStatus> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === 'known' || value === 'unknown' || value === 'unseen') {
        clean[key] = value;
      }
    }
    return clean;
  } catch {
    return {};
  }
}

function loadSavedCustomTerms(): FlashcardTerm[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_TERMS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is FlashcardTerm =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          (item.category === 'nursing' ||
            item.category === 'culinary' ||
            item.category === 'engineering') &&
          typeof item.term === 'string' &&
          typeof item.meaning === 'string',
      )
      .map((item) => ({
        id: item.id,
        category: item.category,
        term: item.term,
        subTerm: typeof item.subTerm === 'string' ? item.subTerm : '',
        meaning: item.meaning,
        example: typeof item.example === 'string' ? item.example : '',
        isCustom: true,
      }));
  } catch {
    return [];
  }
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('nursing');
  const [customTerms, setCustomTerms] = useState<FlashcardTerm[]>(() =>
    loadSavedCustomTerms(),
  );
  const [progressMap, setProgressMap] = useState<Record<string, StudyStatus>>(
    () => loadSavedProgress(),
  );
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [progressMap]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CUSTOM_TERMS_STORAGE_KEY,
        JSON.stringify(customTerms),
      );
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [customTerms]);

  const allTerms = useMemo(
    () => [...FLASHCARD_TERMS, ...customTerms],
    [customTerms],
  );

  const activeCategoryMeta = useMemo(
    () => CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0],
    [activeCategory],
  );

  const categoryTerms = useMemo(
    () => allTerms.filter((t) => t.category === activeCategory),
    [allTerms, activeCategory],
  );

  const visibleTerms = useMemo(() => {
    if (filter === 'unknown') {
      return categoryTerms.filter((t) => progressMap[t.id] === 'unknown');
    }
    return categoryTerms;
  }, [categoryTerms, filter, progressMap]);

  const safeIndex =
    visibleTerms.length > 0 ? Math.min(cardIndex, visibleTerms.length - 1) : 0;
  const currentCard = visibleTerms[safeIndex];

  const totalKnownAll = useMemo(
    () => allTerms.filter((t) => progressMap[t.id] === 'known').length,
    [allTerms, progressMap],
  );

  const categoryKnownCount = useMemo(
    () => categoryTerms.filter((t) => progressMap[t.id] === 'known').length,
    [categoryTerms, progressMap],
  );

  const handleSelectCategory = (nextCategory: CategoryId) => {
    setActiveCategory(nextCategory);
    setFilter('all');
    setCardIndex(0);
    setIsFlipped(false);
  };

  const handleChangeFilter = (nextFilter: ReviewFilter) => {
    setFilter(nextFilter);
    setCardIndex(0);
    setIsFlipped(false);
  };

  const handleSelectTerm = (termId: string) => {
    const idxInVisible = visibleTerms.findIndex((t) => t.id === termId);
    if (idxInVisible !== -1) {
      setCardIndex(idxInVisible);
      setIsFlipped(false);
      return;
    }
    const idxInAll = categoryTerms.findIndex((t) => t.id === termId);
    if (idxInAll !== -1) {
      setFilter('all');
      setCardIndex(idxInAll);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (visibleTerms.length === 0) return;
    setIsFlipped(false);
    setCardIndex((prev) =>
      prev <= 0 ? visibleTerms.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    if (visibleTerms.length === 0) return;
    setIsFlipped(false);
    setCardIndex((prev) =>
      prev >= visibleTerms.length - 1 ? 0 : prev + 1,
    );
  };

  const handleMarkStatus = (nextStatus: 'known' | 'unknown') => {
    if (!currentCard) return;
    const targetId = currentCard.id;

    setProgressMap((prev) => ({
      ...prev,
      [targetId]: nextStatus,
    }));

    if (filter === 'unknown' && nextStatus === 'known') {
      setIsFlipped(false);
      setCardIndex((prev) =>
        prev >= visibleTerms.length - 1 ? 0 : prev,
      );
      return;
    }

    if (safeIndex < visibleTerms.length - 1) {
      setIsFlipped(false);
      setCardIndex(safeIndex + 1);
    } else {
      setIsFlipped(false);
    }
  };

  const handleResetCategory = () => {
    setProgressMap((prev) => {
      const next = { ...prev };
      for (const term of categoryTerms) {
        delete next[term.id];
      }
      return next;
    });
    setFilter('all');
    setCardIndex(0);
    setIsFlipped(false);
  };

  const handleAddTerm = (input: NewTermInput) => {
    const newTerm: FlashcardTerm = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category: input.category,
      term: input.term,
      subTerm: input.subTerm,
      meaning: input.meaning,
      example: input.example,
      isCustom: true,
    };

    const nextAllTerms = [...allTerms, newTerm];
    const nextCategoryTerms = nextAllTerms.filter(
      (t) => t.category === input.category,
    );

    setCustomTerms((prev) => [...prev, newTerm]);
    setActiveCategory(input.category);
    setFilter('all');
    setCardIndex(Math.max(0, nextCategoryTerms.length - 1));
    setIsFlipped(false);
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomTerm = (termId: string) => {
    setCustomTerms((prev) => prev.filter((t) => t.id !== termId));
    setProgressMap((prev) => {
      const next = { ...prev };
      delete next[termId];
      return next;
    });
    setIsFlipped(false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isAddModalOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ' && tag !== 'BUTTON') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const currentStatus: StudyStatus = currentCard
    ? progressMap[currentCard.id] ?? 'unseen'
    : 'unseen';

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#102347] flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-[#102347] text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#102347] whitespace-nowrap truncate">
              전공 용어 플래시카드
            </h1>
          </div>

          <div className="text-sm font-semibold text-slate-600 whitespace-nowrap shrink-0 tabular-nums">
            전체 알아요{' '}
            <span className="text-[#EA580C] font-bold">{totalKnownAll}</span> /{' '}
            {allTerms.length}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* 3개 전공 탭 선택 */}
        <nav
          aria-label="전공 과목 선택"
          className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs mb-4"
        >
          {CATEGORIES.map((category) => {
            const isSelected = category.id === activeCategory;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => handleSelectCategory(category.id)}
                aria-current={isSelected ? 'page' : undefined}
                className={`min-h-[46px] px-2 sm:px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#102347] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#102347] hover:bg-slate-50'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </nav>

        {/* 과목 요약 및 단어 추가하기 버튼 바 */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <p className="text-sm sm:text-base font-semibold text-slate-600">
            <span className="text-[#102347] font-bold">
              {activeCategoryMeta.label}
            </span>
            <span className="mx-2 text-slate-300" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums">총 {categoryTerms.length}개 용어</span>
          </p>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-[#EA580C] text-white text-sm sm:text-base font-bold inline-flex items-center gap-1.5 hover:bg-[#C2410C] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>단어 추가하기</span>
          </button>
        </div>

        {/* 모바일: 단일 열 스택 / 데스크톱: 카드 무대(좌) + 학습 현황(우) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* 왼쪽: 플래시카드 & 알아요/모르겠어요 조작 영역 */}
          <div className="lg:col-span-7 space-y-4">
            {currentCard ? (
              <>
                <FlashcardView
                  card={currentCard}
                  categoryLabel={activeCategoryMeta.label}
                  currentIndex={safeIndex}
                  totalCount={visibleTerms.length}
                  isFlipped={isFlipped}
                  status={currentStatus}
                  onToggleFlip={() => setIsFlipped((prev) => !prev)}
                />

                {/* 엄지 손가락 영역: 모르겠어요 / 알아요 기록 버튼 */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleMarkStatus('unknown')}
                    className={`min-h-[58px] px-4 py-3 rounded-2xl text-base sm:text-lg font-bold inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer ${
                      currentStatus === 'unknown'
                        ? 'bg-[#EA580C] text-white ring-2 ring-[#EA580C] ring-offset-2 ring-offset-[#F4F6FA]'
                        : 'bg-[#FFF3EB] text-[#C2410C] border border-[#FDBA74] hover:bg-[#FFE6D5]'
                    }`}
                  >
                    <HelpCircle
                      className="w-5 h-5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">모르겠어요</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus('known')}
                    className={`min-h-[58px] px-4 py-3 rounded-2xl text-base sm:text-lg font-bold inline-flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer ${
                      currentStatus === 'known'
                        ? 'bg-[#102347] text-white ring-2 ring-[#102347] ring-offset-2 ring-offset-[#F4F6FA]'
                        : 'bg-[#102347] text-white hover:bg-[#193366]'
                    }`}
                  >
                    <CheckCircle2
                      className="w-5 h-5 shrink-0 text-[#FF9E64]"
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">알아요</span>
                  </button>
                </div>

                {/* 이전 / 뒤집기 / 다음 이동 바 */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="min-h-[48px] px-4 rounded-2xl bg-white border border-slate-200 text-[#102347] text-sm sm:text-base font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <ChevronLeft
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="whitespace-nowrap">이전</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="min-h-[48px] px-4 rounded-2xl text-sm sm:text-base font-semibold text-slate-600 hover:text-[#102347] inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCw
                      className="w-4 h-4 shrink-0 text-[#EA580C]"
                      aria-hidden="true"
                    />
                    <span className="tabular-nums">
                      {safeIndex + 1} / {visibleTerms.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="min-h-[48px] px-4 rounded-2xl bg-white border border-slate-200 text-[#102347] text-sm sm:text-base font-semibold inline-flex items-center gap-1.5 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span className="whitespace-nowrap">다음</span>
                    <ChevronRight
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {/* 현재 과목 모든 용어를 암기했을 때 안내 */}
                {categoryKnownCount === categoryTerms.length && (
                  <div className="rounded-2xl bg-white border border-[#102347]/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-[#102347]">
                        {activeCategoryMeta.label} {categoryTerms.length}개 용어를
                        모두 외웠어요!
                      </p>
                      <p className="text-sm text-slate-600 mt-0.5">
                        단어를 더 추가하거나 다른 전공 탭을 눌러 이어서 공부해
                        보세요.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetCategory}
                      className="min-h-[44px] px-4 rounded-xl bg-[#FFF3EB] text-[#C2410C] text-sm font-bold whitespace-nowrap hover:bg-[#FFE6D5] transition-colors shrink-0 cursor-pointer"
                    >
                      다시 학습하기
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* '모르겠어요만' 필터에서 해당하는 카드가 없을 때 */
              <div className="min-h-[340px] sm:min-h-[390px] rounded-3xl bg-white border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF3EB] text-[#EA580C] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#102347]">
                  모르겠어요로 남은 용어가 없어요
                </h2>
                <p className="text-base text-slate-600 mt-2 max-w-sm break-keep">
                  {activeCategoryMeta.label} 과목에서 복습이 필요한 카드가
                  없습니다. 전체 카드로 돌아가 다시 확인해 보세요.
                </p>
                <button
                  type="button"
                  onClick={() => handleChangeFilter('all')}
                  className="mt-6 min-h-[48px] px-6 rounded-2xl bg-[#102347] text-white text-base font-bold hover:bg-[#193366] transition-colors cursor-pointer"
                >
                  전체 용어 보기
                </button>
              </div>
            )}
          </div>

          {/* 오른쪽(모바일에서는 하단): 과목 학습 현황 & 용어 목록 */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <TermListPanel
              categoryLabel={activeCategoryMeta.label}
              categoryDesc={activeCategoryMeta.shortDesc}
              terms={categoryTerms}
              progressMap={progressMap}
              activeTermId={currentCard?.id}
              filter={filter}
              onChangeFilter={handleChangeFilter}
              onSelectTerm={handleSelectTerm}
              onDeleteCustomTerm={handleDeleteCustomTerm}
              onResetCategory={handleResetCategory}
            />
          </div>
        </div>
      </main>

      <AddTermModal
        isOpen={isAddModalOpen}
        defaultCategory={activeCategory}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTerm}
      />
    </div>
  );
}
