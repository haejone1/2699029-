export type CategoryId = 'nursing' | 'culinary' | 'engineering';

export type StudyStatus = 'unseen' | 'known' | 'unknown';

export interface FlashcardTerm {
  id: string;
  category: CategoryId;
  term: string;
  subTerm: string;
  meaning: string;
  example: string;
  isCustom?: boolean;
}

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  shortDesc: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'nursing',
    label: '간호·보건',
    shortDesc: '기초간호·해부생리 핵심 용어',
  },
  {
    id: 'culinary',
    label: '조리·제과제빵',
    shortDesc: '조리원리·제과과학 핵심 용어',
  },
  {
    id: 'engineering',
    label: '전기·기계',
    shortDesc: '기초회로·기계설계 핵심 용어',
  },
];

export const FLASHCARD_TERMS: FlashcardTerm[] = [
  // 간호·보건 (5개)
  {
    id: 'nursing-1',
    category: 'nursing',
    term: '활력징후',
    subTerm: 'Vital Signs · V/S',
    meaning:
      '체온, 맥박, 호흡, 혈압의 4가지 기본 생체 징후로, 대상자의 신체 상태 변화를 가장 빠르게 파악하는 핵심 지표입니다.',
    example:
      '병동 실습 첫날, 간호사는 입원 환자의 활력징후를 먼저 측정해 기초 자료로 기록했습니다.',
  },
  {
    id: 'nursing-2',
    category: 'nursing',
    term: '무균술',
    subTerm: 'Asepsis',
    meaning:
      '병원성 미생물의 침입과 전파를 막기 위해 멸균 상태를 유지하거나 미생물 수를 최소화하는 모든 간호 절차입니다.',
    example:
      '주사제를 준비할 때는 감염을 예방하기 위해 철저한 외과적 무균술을 지켜야 합니다.',
  },
  {
    id: 'nursing-3',
    category: 'nursing',
    term: '산소포화도',
    subTerm: 'SpO₂ · Oxygen Saturation',
    meaning:
      '혈액 속 헤모글로빈이 산소와 결합한 비율을 백분율(%)로 나타낸 수치이며, 성인 정상 범위는 보통 95~100%입니다.',
    example:
      '호흡곤란을 호소하는 환자의 손가락에 맥박산소측정기를 끼워 산소포화도를 확인했습니다.',
  },
  {
    id: 'nursing-4',
    category: 'nursing',
    term: '항상성',
    subTerm: 'Homeostasis',
    meaning:
      '외부 환경이 바뀌더라도 인체가 체온, 혈당, 체액 농도 등 내부 환경을 일정하게 유지하려는 생리적 성질입니다.',
    example:
      '더울 때 땀을 흘려 체온을 낮추는 반응은 인체의 항상성을 유지하기 위한 작용입니다.',
  },
  {
    id: 'nursing-5',
    category: 'nursing',
    term: '배뇨곤란',
    subTerm: 'Dysuria',
    meaning:
      '소변을 볼 때 통증이나 타는 듯한 작열감이 느껴지거나, 소변이 시원하게 나오지 않고 힘들게 배뇨하는 증상입니다.',
    example:
      '환자가 배뇨곤란과 잔뇨감을 호소하여 요로감염 여부를 확인하는 소변 검사를 진행했습니다.',
  },

  // 조리·제과제빵 (5개)
  {
    id: 'culinary-1',
    category: 'culinary',
    term: '블랜칭',
    subTerm: 'Blanching · 데치기',
    meaning:
      '채소나 과일을 끓는 물이나 증기에 짧게 익힌 뒤 즉시 찬물에 식혀 색과 식감을 살리고 효소 작용을 멈추는 조리법입니다.',
    example:
      '시금치의 선명한 초록빛을 유지하기 위해 끓는 물에 30초간 블랜칭한 뒤 얼음물에 헹궜습니다.',
  },
  {
    id: 'culinary-2',
    category: 'culinary',
    term: '글루텐',
    subTerm: 'Gluten',
    meaning:
      '밀가루의 글리아딘과 글루테닌 단백질이 물과 반죽을 만나 결합해 만드는 탄력 있고 점성 있는 그물 구조입니다.',
    example:
      '식빵은 쫄깃한 식감을 내기 위해 강력분을 충분히 치대어 글루텐을 형성해야 합니다.',
  },
  {
    id: 'culinary-3',
    category: 'culinary',
    term: '템퍼링',
    subTerm: 'Tempering · 온도 조절',
    meaning:
      '초콜릿을 녹였다가 온도를 낮추고 다시 살짝 올려 코코아 버터 결정을 안정시켜 광택과 바삭함을 살리는 작업입니다.',
    example:
      '다크 초콜릿의 템퍼링 온도를 정확히 맞추자 표면에 하얀 반점 없이 매끈한 광택이 살아났습니다.',
  },
  {
    id: 'culinary-4',
    category: 'culinary',
    term: '마이야르 반응',
    subTerm: 'Maillard Reaction',
    meaning:
      '식재료의 아미노산과 당분이 140℃ 이상의 열에서 결합해 먹음직스러운 갈색 빛깔과 고소한 풍미를 내는 반응입니다.',
    example:
      '스테이크를 센 불에 구워 겉면에 바삭한 갈색 크러스트를 입히는 것은 마이야르 반응을 활용한 것입니다.',
  },
  {
    id: 'culinary-5',
    category: 'culinary',
    term: '에멀션',
    subTerm: 'Emulsion · 유화',
    meaning:
      '물과 기름처럼 원래 섞이지 않는 두 액체를 계면활성제나 난황을 매개로 고르게 분산시켜 안정적으로 섞는 상태입니다.',
    example:
      '마요네즈를 만들 때 달걀노른자의 레시틴 성분이 식초와 식용유를 묶어주어 에멀션이 형성됩니다.',
  },

  // 전기·기계 (5개)
  {
    id: 'engineering-1',
    category: 'engineering',
    term: '옴의 법칙',
    subTerm: "Ohm's Law · V = I × R",
    meaning:
      '회로에 흐르는 전류(I)는 전압(V)에 비례하고 저항(R)에 반비례한다는 전기 회로의 가장 기본적인 법칙입니다.',
    example:
      '저항이 10Ω인 회로에 20V 전압을 걸었을 때 옴의 법칙에 따라 2A의 전류가 흐릅니다.',
  },
  {
    id: 'engineering-2',
    category: 'engineering',
    term: '토크',
    subTerm: 'Torque · 회전력',
    meaning:
      '물체를 특정 축을 중심으로 회전시키려는 힘의 크기로, 작용하는 힘과 회전축으로부터의 거리를 곱해 구합니다.',
    example:
      '꽉 조여진 볼트를 풀 때 손잡이가 긴 렌치를 사용하면 같은 힘으로도 더 큰 토크를 낼 수 있습니다.',
  },
  {
    id: 'engineering-3',
    category: 'engineering',
    term: '단락',
    subTerm: 'Short Circuit · 합선',
    meaning:
      '전위차가 있는 두 도선이 저항이 거의 없는 상태로 직접 닿아 비정상적으로 매우 큰 과전류가 흐르는 현상입니다.',
    example:
      '피복이 벗겨진 전선이 서로 닿아 단락이 발생하자 안전을 위해 차단기가 즉시 내려갔습니다.',
  },
  {
    id: 'engineering-4',
    category: 'engineering',
    term: '공차',
    subTerm: 'Tolerance',
    meaning:
      '기계 부품을 가공할 때 설계 기준 치수에서 허용되는 최대 오차 범위로, 부품의 호환성과 조립 정밀도를 보장합니다.',
    example:
      '축과 베어링이 헐겁거나 빡빡하지 않고 정확히 끼워지도록 도면에 공차를 ±0.02mm로 표기했습니다.',
  },
  {
    id: 'engineering-5',
    category: 'engineering',
    term: '교류와 직류',
    subTerm: 'AC & DC',
    meaning:
      '직류(DC)는 전류의 방향과 크기가 일정하고, 교류(AC)는 시간에 따라 전류의 방향과 크기가 주기적으로 바뀝니다.',
    example:
      '콘센트의 교류 전기는 노트북 어댑터를 거치면서 배터리에 저장할 수 있는 직류로 변환됩니다.',
  },
];
