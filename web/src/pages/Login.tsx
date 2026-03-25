import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, resetPassword } from '../services/authService';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(phone, password);
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

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setResetMsg('');
    setLoading(true);
    try {
      const res = await resetPassword(phone, oldPwd, newPwd);
      if (res.success) {
        setResetMsg('密码修改成功，请登录');
        setMode('login');
        setPassword('');
        setOldPwd('');
        setNewPwd('');
      } else {
        setResetMsg(res.errMsg || '修改失败');
      }
    } catch {
      setResetMsg('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">导游调度系统</h1>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="password"
              maxLength={20}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
            {resetMsg && <p className="text-sm text-green-500">{resetMsg}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 11 || password.length === 0}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white text-base font-medium disabled:opacity-50 active:bg-indigo-700"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <p className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setResetMsg('');
                }}
                className="text-sm text-indigo-500"
              >
                修改密码
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="password"
              maxLength={20}
              placeholder="原密码"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="password"
              maxLength={20}
              placeholder="新密码（至少4位）"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            {resetMsg && <p className="text-sm text-red-500">{resetMsg}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 11 || oldPwd.length === 0 || newPwd.length < 4}
              className="w-full py-3 rounded-lg bg-indigo-600 text-white text-base font-medium disabled:opacity-50 active:bg-indigo-700"
            >
              {loading ? '提交中...' : '确认修改'}
            </button>

            <p className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetMsg('');
                }}
                className="text-sm text-indigo-500"
              >
                返回登录
              </button>
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">仅限内部人员使用</p>
      </div>
    </div>
  );
}
