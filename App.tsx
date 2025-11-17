
import React, { useState, useEffect, useCallback } from 'react';
import { ExchangeRateData } from './types';
import ExchangeRateChart from './components/ExchangeRateChart';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import RateAnalysis from './components/RateAnalysis';
import BuySignal from './components/BuySignal';
import NotificationManager from './components/NotificationManager';

const App: React.FC = () => {
  const [data, setData] = useState<ExchangeRateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const fetchExchangeRateData = useCallback(async (isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    }
    setError(null);
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const startDate = formatDate(thirtyDaysAgo);
      const endDate = formatDate(today);

      const response = await fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=USD&to=KRW`);
      if (!response.ok) {
        throw new Error('환율 데이터 API를 호출하는 데 실패했습니다.');
      }
      const apiData = await response.json();
      
      const rates = apiData.rates;
      const processedData: ExchangeRateData[] = [];
      let currentDate = new Date(thirtyDaysAgo);
      let lastKnownRate = 0;

      const sortedDates = Object.keys(rates).sort();
      if (sortedDates.length > 0) {
        lastKnownRate = rates[sortedDates[0]].KRW;
      }

      while (currentDate <= today) {
        const dateString = formatDate(currentDate);
        const rate = rates[dateString]?.KRW;

        if (rate) {
          lastKnownRate = rate;
        }

        if(lastKnownRate > 0) {
            processedData.push({
                date: `${currentDate.getMonth() + 1}/${currentDate.getDate()}`,
                rate: parseFloat(lastKnownRate.toFixed(2)),
                day: currentDate.getDay(),
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      setData(processedData);
      if (processedData.length > 0) {
        const latestRate = processedData[processedData.length - 1].rate;
        setCurrentRate(latestRate);
      }
      setLastUpdated(new Date());

    } catch (err) {
      setError('환율 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
      console.error(err);
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchExchangeRateData(true);
    const intervalId = setInterval(() => fetchExchangeRateData(false), 60000); // 60초마다 데이터 갱신

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 정리
  }, [fetchExchangeRateData]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-2 sm:p-4 lg:p-6 font-sans">
      <div className="w-full max-w-5xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6">
        <header className="mb-4 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-1">최근 30일 달러 환율</h1>
          <p className="text-gray-400 text-base">USD/KRW 환율 변동 추이 (1분마다 자동 갱신)</p>
        </header>

        {data.length > 0 && !loading && !error && (
            <BuySignal data={data} currentRate={currentRate} />
        )}

        {currentRate > 0 && !loading && !error && (
            <div className="text-center mb-4 bg-gray-800 p-4 rounded-xl ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20 relative">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-gray-300 text-base">최신 환율</p>
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </div>
                </div>
                <p className="text-4xl font-bold text-white tracking-tight">{currentRate.toLocaleString()} <span className="text-xl text-gray-400 align-baseline">KRW</span></p>
                 {lastUpdated && (
                    <p className="text-gray-500 text-xs mt-1">
                        마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR')}
                    </p>
                )}
            </div>
        )}

        <main className="h-80 w-full">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <ExchangeRateChart data={data} />
          )}
        </main>
        {data.length > 0 && !error && <RateAnalysis data={data} currentRate={currentRate} />}
        <NotificationManager />
      </div>
      <footer className="text-center text-gray-600 mt-4 text-xs">
        <p>환율 데이터 출처: frankfurter.app (유럽 중앙은행 고시 환율 기준)</p>
      </footer>
    </div>
  );
};

export default App;
