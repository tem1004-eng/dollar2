import React, { useState, useEffect, useCallback } from 'react';
import { ExchangeRateData } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface BuySignalProps {
  data: ExchangeRateData[];
  currentRate: number;
}

interface AnalysisResponse {
  advantagePercentage: number;
  reason: string;
}

const BuySignal: React.FC<BuySignalProps> = ({ data, currentRate }) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (data.length < 2) {
      setLoading(false);
      return; // Not enough data to analyze
    }
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const rateDataString = data.map(d => d.rate).join(', ');
      const prompt = `
        당신은 금융 분석가입니다. 최근 30일간의 USD/KRW 환율 데이터는 다음과 같습니다: ${rateDataString}.
        현재 환율은 ${currentRate} KRW 입니다.

        이 데이터를 바탕으로, 지금 달러를 매수하는 것이 얼마나 유리한지 0에서 100 사이의 백분율 수치로 알려주세요.
        100에 가까울수록 매수하기 매우 유리함을 의미하고, 0에 가까울수록 매우 불리함을 의미합니다.
        그리고 그 이유를 한 문장으로 간결하게 설명해주세요.

        결과는 반드시 아래 JSON 형식으로 제공해주세요.
      `;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              advantagePercentage: {
                type: Type.NUMBER,
                description: 'The advantage percentage of buying dollars now (0-100).',
              },
              reason: {
                type: Type.STRING,
                description: 'A concise reason for the analysis.',
              },
            },
            required: ['advantagePercentage', 'reason'],
          },
        },
      });

      const parsedAnalysis: AnalysisResponse = JSON.parse(response.text);
      // Clamp percentage just in case the model returns a value outside 0-100
      parsedAnalysis.advantagePercentage = Math.round(Math.max(0, Math.min(100, parsedAnalysis.advantagePercentage)));
      setAnalysis(parsedAnalysis);
    } catch (err) {
      setError('AI 분석에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error('Error during AI analysis:', err);
    } finally {
      setLoading(false);
    }
  }, [data, currentRate]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const getBarColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="text-center my-2 text-gray-400 text-sm">
        AI가 매수 시점을 분석 중입니다...
      </div>
    );
  }

  if (error) {
    return <div className="text-center my-2 text-red-400">{error}</div>;
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="my-2 p-2 bg-gray-900 rounded-lg text-center">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
            지금 달러를 사는 것이 <span className="text-cyan-400">{analysis.advantagePercentage}%</span> 유리함
        </h3>
        <div className="w-full bg-gray-700 rounded-full h-3 mb-1" title={`유리도: ${analysis.advantagePercentage}%`}>
            <div
                className={`h-3 rounded-full transition-all duration-500 ${getBarColor(analysis.advantagePercentage)}`}
                style={{ width: `${analysis.advantagePercentage}%` }}
                role="progressbar"
                aria-valuenow={analysis.advantagePercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`달러 매수 유리도 ${analysis.advantagePercentage} 퍼센트`}
            ></div>
        </div>
        <p className="text-gray-400 text-xs">{analysis.reason}</p>
    </div>
  );
};

export default BuySignal;
