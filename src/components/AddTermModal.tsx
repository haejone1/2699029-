import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { CATEGORIES, type CategoryId } from '../data/flashcards';

export interface NewTermInput {
  category: CategoryId;
  term: string;
  subTerm: string;
  meaning: string;
  example: string;
}

interface AddTermModalProps {
  isOpen: boolean;
  defaultCategory: CategoryId;
  onClose: () => void;
  onSubmit: (input: NewTermInput) => void;
}

export function AddTermModal({
  isOpen,
  defaultCategory,
  onClose,
  onSubmit,
}: AddTermModalProps) {
  const [category, setCategory] = useState<CategoryId>(defaultCategory);
  const [term, setTerm] = useState('');
  const [subTerm, setSubTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatusMsg, setAiStatusMsg] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  const lastAutofilledKeyRef = useRef<string>('');
  const isComposingRef = useRef(false);

  const cancelPendingRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      cancelPendingRequest();
      setCategory(defaultCategory);
      setTerm('');
      setSubTerm('');
      setMeaning('');
      setExample('');
      setErrorMsg('');
      setIsGenerating(false);
      setAiStatusMsg('');
      lastAutofilledKeyRef.current = '';
    } else {
      cancelPendingRequest();
    }
  }, [isOpen, defaultCategory, cancelPendingRequest]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchAiDefinition = useCallback(
    async (targetTerm: string, targetCategory: CategoryId, force = false) => {
      const cleanTerm = targetTerm.trim();
      if (!cleanTerm) {
        if (force) {
          setErrorMsg('먼저 용어 이름을 입력해 주세요.');
        }
        return;
      }

      const key = `${targetCategory}:${cleanTerm}`;
      if (!force && lastAutofilledKeyRef.current === key) {
        return;
      }

      cancelPendingRequest();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsGenerating(true);
      setErrorMsg('');
      setAiStatusMsg('AI가 전공 용어의 뜻과 예문을 작성하고 있어요...');

      try {
        const res = await fetch('/api/terms/autofill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            term: cleanTerm,
            category: targetCategory,
          }),
          signal: controller.signal,
        });

        const data = (await res.json()) as {
          subTerm?: string;
          meaning?: string;
          example?: string;
          error?: string;
        };

        if (!res.ok) {
          throw new Error(
            data.error || 'AI 자동 작성에 실패했습니다. 직접 입력해 주세요.',
          );
        }

        if (controller.signal.aborted) return;

        lastAutofilledKeyRef.current = key;
        if (typeof data.subTerm === 'string') {
          setSubTerm(data.subTerm);
        }
        if (typeof data.meaning === 'string') {
          setMeaning(data.meaning);
        }
        if (typeof data.example === 'string') {
          setExample(data.example);
        }
        setAiStatusMsg('AI가 뜻과 예문을 채웠어요. 필요하면 바로 수정할 수 있어요.');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setAiStatusMsg('');
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'AI 자동 작성 중 오류가 발생했습니다.',
        );
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsGenerating(false);
        }
      }
    },
    [cancelPendingRequest],
  );

  // 단어를 입력하고 잠시 멈추면 (뜻이 비어 있을 때) 자동으로 AI가 뜻을 채워줌
  useEffect(() => {
    if (!isOpen) return;
    const cleanTerm = term.trim();
    if (cleanTerm.length < 2) return;
    if (meaning.trim() !== '') return;
    if (isComposingRef.current) return;

    const timer = window.setTimeout(() => {
      if (!isComposingRef.current && meaning.trim() === '') {
        void fetchAiDefinition(cleanTerm, category, false);
      }
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [isOpen, term, category, meaning, fetchAiDefinition]);

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTerm = term.trim();
    const trimmedMeaning = meaning.trim();

    if (!trimmedTerm) {
      setErrorMsg('용어 이름을 입력해 주세요.');
      return;
    }
    if (!trimmedMeaning) {
      setErrorMsg('용어 뜻을 입력하거나 AI로 뜻 채우기를 눌러 주세요.');
      return;
    }

    onSubmit({
      category,
      term: trimmedTerm,
      subTerm: subTerm.trim(),
      meaning: trimmedMeaning,
      example: example.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#102347]/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-term-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white text-[#102347] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 모바일 바텀 시트 손잡이 */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0">
          <span
            className="w-10 h-1.5 rounded-full bg-slate-300"
            aria-hidden="true"
          />
        </div>

        {/* 모달 헤더 */}
        <div className="px-5 sm:px-6 pt-3 sm:pt-6 pb-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2
              id="add-term-title"
              className="text-xl font-bold text-[#102347]"
            >
              새 전공 용어 추가하기
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              단어를 적으면 AI가 뜻과 예문을 자동으로 채워줘요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="창 닫기"
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-[#102347] hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* 입력 폼 */}
        <form
          onSubmit={handleFormSubmit}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4"
        >
          {/* 과목 선택 */}
          <div>
            <span className="block text-sm font-bold text-[#102347] mb-2">
              과목 선택
            </span>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#F4F6FA]">
              {CATEGORIES.map((cat) => {
                const selected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`min-h-[44px] px-2 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#102347] text-white shadow-xs'
                        : 'text-slate-600 hover:text-[#102347]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 용어 이름 (필수) + AI로 뜻 채우기 버튼 */}
          <div>
            <label
              htmlFor="input-term"
              className="block text-sm font-bold text-[#102347] mb-1.5"
            >
              용어 이름 <span className="text-[#EA580C]">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="input-term"
                type="text"
                value={term}
                onCompositionStart={() => {
                  isComposingRef.current = true;
                }}
                onCompositionEnd={() => {
                  isComposingRef.current = false;
                }}
                onChange={(e) => {
                  setTerm(e.target.value);
                  if (errorMsg) setErrorMsg('');
                  if (aiStatusMsg) setAiStatusMsg('');
                }}
                onBlur={() => {
                  if (
                    term.trim().length >= 2 &&
                    meaning.trim() === '' &&
                    !isGenerating
                  ) {
                    void fetchAiDefinition(term, category, false);
                  }
                }}
                placeholder="예: 중심정맥압"
                maxLength={40}
                className="flex-1 min-h-[48px] px-4 rounded-2xl bg-[#F4F6FA] border border-slate-200 text-base text-[#102347] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#102347] focus:ring-2 focus:ring-[#102347]/15"
              />
              <button
                type="button"
                disabled={isGenerating || !term.trim()}
                onClick={() => void fetchAiDefinition(term, category, true)}
                className="min-h-[48px] px-4 rounded-2xl bg-[#102347] text-white text-sm sm:text-base font-bold inline-flex items-center justify-center gap-1.5 hover:bg-[#193366] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2
                      className="w-4 h-4 animate-spin shrink-0 text-[#FF9E64]"
                      aria-hidden="true"
                    />
                    <span>작성 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles
                      className="w-4 h-4 shrink-0 text-[#FF9E64]"
                      aria-hidden="true"
                    />
                    <span>AI 뜻 채우기</span>
                  </>
                )}
              </button>
            </div>
            {aiStatusMsg && (
              <p
                aria-live="polite"
                className="mt-2 text-xs sm:text-sm font-medium text-[#102347]/80"
              >
                {aiStatusMsg}
              </p>
            )}
          </div>

          {/* 원어 / 보조 표기 (선택) */}
          <div>
            <label
              htmlFor="input-subterm"
              className="block text-sm font-bold text-[#102347] mb-1.5"
            >
              영어·약어 표기{' '}
              <span className="text-slate-400 font-medium">(선택)</span>
            </label>
            <input
              id="input-subterm"
              type="text"
              value={subTerm}
              onChange={(e) => setSubTerm(e.target.value)}
              placeholder="예: Central Venous Pressure · CVP"
              maxLength={60}
              className="w-full min-h-[48px] px-4 rounded-2xl bg-[#F4F6FA] border border-slate-200 text-base text-[#102347] placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#102347] focus:ring-2 focus:ring-[#102347]/15"
            />
          </div>

          {/* 용어 뜻 (필수) */}
          <div>
            <label
              htmlFor="input-meaning"
              className="block text-sm font-bold text-[#102347] mb-1.5"
            >
              용어 뜻 <span className="text-[#EA580C]">*</span>
            </label>
            <textarea
              id="input-meaning"
              rows={3}
              value={meaning}
              onChange={(e) => {
                setMeaning(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder={
                isGenerating
                  ? 'AI가 용어 뜻을 작성하고 있어요...'
                  : '예: 상대정맥과 우심방이 만나는 부위의 혈압으로, 체액량 상태를 평가하는 지표입니다.'
              }
              maxLength={240}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FA] border border-slate-200 text-base text-[#102347] placeholder:text-slate-400 leading-relaxed focus:outline-none focus:bg-white focus:border-[#102347] focus:ring-2 focus:ring-[#102347]/15 resize-none"
            />
          </div>

          {/* 실전 예문 (선택) */}
          <div>
            <label
              htmlFor="input-example"
              className="block text-sm font-bold text-[#102347] mb-1.5"
            >
              실전 예문{' '}
              <span className="text-slate-400 font-medium">(선택)</span>
            </label>
            <textarea
              id="input-example"
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder={
                isGenerating
                  ? '실전 예문도 함께 준비하고 있어요...'
                  : '예: 수액 공급 속도를 조절하기 전에 환자의 중심정맥압을 측정했습니다.'
              }
              maxLength={240}
              className="w-full px-4 py-3 rounded-2xl bg-[#F4F6FA] border border-slate-200 text-base text-[#102347] placeholder:text-slate-400 leading-relaxed focus:outline-none focus:bg-white focus:border-[#102347] focus:ring-2 focus:ring-[#102347]/15 resize-none"
            />
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="text-sm font-semibold text-[#C2410C] bg-[#FFF6F0] border border-[#FFDCC7] rounded-xl px-3.5 py-2.5"
            >
              {errorMsg}
            </p>
          )}

          {/* 하단 버튼 */}
          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[52px] px-4 rounded-2xl bg-slate-100 text-slate-700 text-base font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="min-h-[52px] px-4 rounded-2xl bg-[#EA580C] text-white text-base font-bold hover:bg-[#C2410C] disabled:opacity-60 transition-colors cursor-pointer"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
