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
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1e6fff 0%, #1890ff 100%)' }}
    >
      {/* Mountain silhouette decoration */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: '40vh', opacity: 0.1 }}
      >
        <path
          fill="#fff"
          d="M0,160L60,170.7C120,181,240,203,360,186.7C480,171,600,117,720,112C840,107,960,149,1080,165.3C1200,181,1320,171,1380,165.3L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">新世纪导游调度系统</h1>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password"
              maxLength={20}
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {error && <p className="text-sm text-red-300">{error}</p>}
            {resetMsg && <p className="text-sm text-green-300">{resetMsg}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 11 || password.length === 0}
              className="w-full py-3 rounded-lg bg-white text-blue-600 text-base font-semibold disabled:opacity-50 active:bg-gray-100 shadow-md"
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
                className="text-sm text-white/70"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password"
              maxLength={20}
              placeholder="原密码"
              value={oldPwd}
              onChange={(e) => setOldPwd(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="password"
              maxLength={20}
              placeholder="新密码（至少4位）"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {resetMsg && <p className="text-sm text-red-300">{resetMsg}</p>}

            <button
              type="submit"
              disabled={loading || phone.length !== 11 || oldPwd.length === 0 || newPwd.length < 4}
              className="w-full py-3 rounded-lg bg-white text-blue-600 text-base font-semibold disabled:opacity-50 active:bg-gray-100 shadow-md"
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
                className="text-sm text-white/70"
              >
                返回登录
              </button>
            </p>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-white/40">仅限内部人员使用</p>
      </div>
    </div>
  );
}
