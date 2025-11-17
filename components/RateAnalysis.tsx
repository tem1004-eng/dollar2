
import React, { useState, useCallback } from 'react';
import { ExchangeRateData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { GoogleGenAI } from '@google/genai';

interface RateAnalysisProps {
  data: ExchangeRateData[];
  currentRate: number;
}

const RateAnalysis: React.FC<RateAnalysisProps> = ({ data, currentRate }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = useCallback(async () => {
    if (data.length === 0) {
      setError('분석할 데이터가 없습니다.');
      return;
    }

    setLoading(true);
    setAnalysis('');
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const rateDataString = data.map(d => `${d.date}: ${d.rate}`).join('\n');
      const prompt = `
        다음은 최근 30일간의 USD/KRW 환율 데이터입니다:
        ${rateDataString}

        현재 환율은 ${currentRate} KRW 입니다.

        이 데이터를 바탕으로 최근 환율 변동의 주요 원인을 전문가의 관점에서 분석해주세요. 
        분석에는 다음과 같은 내용을 포함해주세요:
        1. 전반적인 환율 추세 (상승, 하락, 보합)
        2. 이러한 변동에 영향을 미쳤을 가능성이 있는 경제적, 정치적 요인 (예: 미국 및 한국의 경제 지표, 글로벌 시장 상황, 중앙은행 정책 등)
        3. 향후 환율에 대한 간략한 전망.

        결과는 마크다운 형식으로 자연스럽게 서술해주세요.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      setAnalysis(response.text);

    } catch (err) {
      setError('환율 변동 원인 분석 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [data, currentRate]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <h2 className="text-lg font-semibold text-cyan-400 mb-2 text-center">AI 환율 변동 원인 분석</h2>
      <div className="max-w-3xl mx-auto bg-gray-900 p-4 rounded-lg">
        <p className="text-gray-400 text-center text-sm mb-4">
          최근 환율 변동의 원인이 궁금하신가요? AI가 최신 뉴스와 시세를 바탕으로 분석해 드립니다.
        </p>
        <div className="flex items-center justify-center">
          <button
            onClick={handleAnalysis}
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 text-sm rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105"
          >
            {loading ? '분석 중...' : '환율 변동 이유 분석하기'}
          </button>
        </div>

        <div className="mt-4 min-h-[80px]">
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {analysis && (
            <div className="p-3 bg-gray-800 rounded-lg text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
              {analysis}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RateAnalysis;
