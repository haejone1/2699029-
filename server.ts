import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const CATEGORY_LABELS: Record<string, string> = {
  nursing: '간호·보건 (기초간호·해부생리·임상실습)',
  culinary: '조리·제과제빵 (조리원리·제과제빵과학)',
  engineering: '전기·기계 (기초회로·기계공학·설계)',
};

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/terms/autofill', async (req, res) => {
    const rawTerm = typeof req.body?.term === 'string' ? req.body.term.trim() : '';
    const rawCategory =
      typeof req.body?.category === 'string' ? req.body.category : 'nursing';

    if (!rawTerm) {
      res.status(400).json({ error: '용어 이름을 먼저 입력해 주세요.' });
      return;
    }

    if (rawTerm.length > 60) {
      res
        .status(400)
        .json({ error: '용어 이름은 60자 이내로 입력해 주세요.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error:
          'GEMINI_API_KEY가 설정되어 있지 않아 AI 자동 작성을 사용할 수 없습니다.',
      });
      return;
    }

    const categoryContext =
      CATEGORY_LABELS[rawCategory] ?? CATEGORY_LABELS.nursing;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `전공 분야: ${categoryContext}\n용어: "${rawTerm}"\n\n이 전공 용어에 대해 대학 1학년 시험 공부용 플래시카드 데이터를 작성해 주세요.`,
        config: {
          systemInstruction:
            '당신은 한국 대학 1학년 전공 시험 대비 플래시카드를 작성하는 친절한 전공 조교입니다. ' +
            '사용자가 입력한 전공 용어에 대해 정확하고 이해하기 쉬운 한국어 설명을 JSON으로 반환하세요. ' +
            'subTerm에는 해당 용어의 대표적인 영어 표기나 약어(예: "Central Venous Pressure · CVP" 또는 "Blanching · 데치기")를 간결하게 적고, 없으면 빈 문자열로 두세요. ' +
            'meaning에는 1~2문장(70~140자 내외)의 명확한 핵심 정의를 한국어 경어체("~입니다.")로 작성하세요. ' +
            'example에는 해당 전공의 실습·현장 상황에서 이 용어가 실제로 쓰이는 1문장(50~110자 내외)의 실전 예문을 한국어로 작성하며, 가능하면 용어 단어를 자연스럽게 포함하세요.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subTerm: {
                type: Type.STRING,
                description: '영어 원어 및 약어 표기 (간결하게)',
              },
              meaning: {
                type: Type.STRING,
                description: '대학 1학년 눈높이의 명확한 한국어 뜻 (1~2문장)',
              },
              example: {
                type: Type.STRING,
                description: '전공 현장을 담은 자연스러운 한국어 실전 예문 (1문장)',
              },
            },
            required: ['subTerm', 'meaning', 'example'],
          },
        },
      });

      const rawJson = (response.text ?? '').trim();
      if (!rawJson) {
        res
          .status(502)
          .json({ error: 'AI 응답이 비어 있습니다. 다시 시도해 주세요.' });
        return;
      }

      const parsed = JSON.parse(rawJson) as {
        subTerm?: unknown;
        meaning?: unknown;
        example?: unknown;
      };

      const meaning =
        typeof parsed.meaning === 'string' ? parsed.meaning.trim() : '';
      const subTerm =
        typeof parsed.subTerm === 'string' ? parsed.subTerm.trim() : '';
      const example =
        typeof parsed.example === 'string' ? parsed.example.trim() : '';

      if (!meaning) {
        res.status(502).json({
          error: '용어 뜻을 생성하지 못했습니다. 다시 시도해 주세요.',
        });
        return;
      }

      res.json({ subTerm, meaning, example });
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : String(error);
      console.error('Gemini autofill error:', errMessage);

      if (errMessage.includes('429') || errMessage.includes('RESOURCE_EXHAUSTED')) {
        res.status(429).json({
          error:
            '잠시 요청이 많아 AI 자동 작성이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
        });
        return;
      }

      res.status(500).json({
        error:
          'AI로 용어 뜻을 불러오는 중 문제가 발생했습니다. 직접 입력하거나 다시 시도해 주세요.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
