import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(phone);
      if (res.success && res.data) {
        navigate(res.data.role === 'admin' ? '/admin' : '/guide', { replace: true });
      } else {
        setError(res.errMsg || '登录失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">导游调度系统</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || phone.length !== 11}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white text-base font-medium disabled:opacity-50 active:bg-indigo-700"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">仅限内部人员使用</p>
      </div>
    </div>
  );
}
