
import React, { useState, useEffect } from 'react';

const NotificationManager: React.FC = () => {
  const [email, setEmail] = useState('');
  const [notify9am, setNotify9am] = useState(false);
  const [notify6pm, setNotify6pm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      try {
        const { email, notify9am, notify6pm } = JSON.parse(savedSettings);
        setEmail(email || '');
        setNotify9am(notify9am || false);
        setNotify6pm(notify6pm || false);
      } catch (error) {
        console.error("Failed to parse notification settings:", error);
      }
    }
  }, []);

  const handleSave = () => {
    const settings = { email, notify9am, notify6pm };
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); // Hide message after 3 seconds
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <h2 className="text-lg font-semibold text-cyan-400 mb-2 text-center">이메일 알림 설정</h2>
      <div className="max-w-md mx-auto bg-gray-900 p-4 rounded-lg">
        <div className="mb-3">
          <label htmlFor="email" className="block text-gray-400 text-sm font-bold mb-1">
            이메일 주소
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-1 px-2 text-sm bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:shadow-outline"
            placeholder="example@email.com"
            aria-label="Email address for notifications"
          />
        </div>
        <div className="mb-4">
          <p className="block text-gray-400 text-sm font-bold mb-1">알림 시간</p>
          <div className="flex items-center justify-around">
             <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={notify9am}
                onChange={(e) => setNotify9am(e.target.checked)}
                className="form-checkbox h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600"
              />
              <span className="ml-2 text-sm">오전 9시</span>
            </label>
             <label className="flex items-center text-white cursor-pointer">
              <input
                type="checkbox"
                checked={notify6pm}
                onChange={(e) => setNotify6pm(e.target.checked)}
                className="form-checkbox h-4 w-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600"
              />
              <span className="ml-2 text-sm">오후 6시</span>
            </label>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 text-sm rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
            aria-live="polite"
          >
            설정 저장
          </button>
        </div>
        {saved && (
          <p className="text-green-400 text-center text-xs mt-2" role="status">설정이 저장되었습니다!</p>
        )}
         <p className="text-gray-500 text-xs text-center mt-2">
          참고: 이 기능은 데모용입니다. 실제 이메일은 발송되지 않습니다. 보안 및 안정성을 위해 이메일 발송은 서버 측 기능이 필요합니다.
        </p>
      </div>
    </div>
  );
};

export default NotificationManager;
