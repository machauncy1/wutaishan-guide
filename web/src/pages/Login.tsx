import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, resetPassword } from '../services/authService';

const inputClass =
  'w-full h-12 px-4 rounded-xl text-[15px] text-white placeholder-white/50 ' +
  'outline-none transition-all duration-200 ' +
  'bg-[rgba(0,0,0,0.2)] border border-white/15 ' +
  'focus:border-blue-400/60 focus:bg-[rgba(0,0,0,0.25)]';

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function SubmitButton({
  disabled,
  loading,
  children,
  loadingText,
}: {
  disabled: boolean;
  loading: boolean;
  children: string;
  loadingText: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full h-12 rounded-xl text-[15px] font-semibold transition-all duration-200 disabled:cursor-not-allowed"
      style={{
        background: disabled ? 'rgba(255, 255, 255, 0.15)' : '#ffffff',
        color: disabled ? 'rgba(255,255,255,0.35)' : '#1e40af',
        boxShadow: disabled ? 'none' : '0 4px 20px -2px rgba(0, 0, 0, 0.25)',
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Spinner />
          {loadingText}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

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

  const loginDisabled = loading || phone.length !== 11 || password.length === 0;
  const resetDisabled = loading || phone.length !== 11 || oldPwd.length === 0 || newPwd.length < 4;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 深蓝渐变背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 30%, #134e8a 60%, #1a6fc4 100%)',
        }}
      />

      {/* 经纬线动画 */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .orbit { animation: spin 60s linear infinite; transform-origin: 400px 400px; }
          .orbit-rev { animation: spin 80s linear infinite reverse; transform-origin: 400px 400px; }
        `}</style>
        <g className="orbit">
          <ellipse cx="400" cy="400" rx="350" ry="150" fill="none" stroke="#fff" strokeWidth="1" />
          <ellipse
            cx="400"
            cy="400"
            rx="300"
            ry="200"
            fill="none"
            stroke="#fff"
            strokeWidth="0.8"
          />
          <ellipse
            cx="400"
            cy="400"
            rx="250"
            ry="300"
            fill="none"
            stroke="#fff"
            strokeWidth="0.6"
          />
        </g>
        <g className="orbit-rev">
          <ellipse
            cx="400"
            cy="400"
            rx="380"
            ry="180"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            transform="rotate(60 400 400)"
          />
          <ellipse
            cx="400"
            cy="400"
            rx="320"
            ry="120"
            fill="none"
            stroke="#fff"
            strokeWidth="0.5"
            transform="rotate(-30 400 400)"
          />
        </g>
        <circle cx="400" cy="400" r="360" fill="none" stroke="#fff" strokeWidth="0.4" />
      </svg>

      {/* 光晕 */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          top: '-10%',
          right: '-10%',
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)',
          bottom: '-5%',
          left: '-5%',
        }}
      />

      {/* 卡片区域 */}
      <div className="relative z-10 w-full max-w-[380px] mx-4 pt-12">
        {/* 悬浮 Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-1 z-20">
          <img
            src="/logo.png"
            alt="NCTS"
            className="w-[80px] h-[80px] rounded-full"
            style={{
              border: '3px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.4)',
            }}
          />
        </div>

        {/* 毛玻璃卡片 */}
        <div
          className="rounded-3xl px-8 pt-16 pb-8"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-[22px] font-semibold tracking-wide text-white">新世纪导游调度</h1>
            <p className="mt-1.5 text-xs tracking-widest text-white/40">NCTS DISPATCH SYSTEM</p>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  maxLength={20}
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && <p className="text-[13px] text-red-400 pl-1">{error}</p>}
              {resetMsg && <p className="text-[13px] text-emerald-400 pl-1">{resetMsg}</p>}

              <SubmitButton disabled={loginDisabled} loading={loading} loadingText="登录中">
                登录
              </SubmitButton>

              <p className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset');
                    setError('');
                    setResetMsg('');
                  }}
                  className="text-[13px] text-white/35 hover:text-white/70 transition-colors duration-200"
                >
                  修改密码
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-3.5">
              <div className="space-y-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  maxLength={20}
                  placeholder="原密码"
                  value={oldPwd}
                  onChange={(e) => setOldPwd(e.target.value)}
                  className={inputClass}
                />
                <input
                  type="password"
                  maxLength={20}
                  placeholder="新密码（至少4位）"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className={inputClass}
                />
              </div>

              {resetMsg && <p className="text-[13px] text-red-400 pl-1">{resetMsg}</p>}

              <SubmitButton disabled={resetDisabled} loading={loading} loadingText="提交中">
                确认修改
              </SubmitButton>

              <p className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setResetMsg('');
                  }}
                  className="text-[13px] text-white/35 hover:text-white/70 transition-colors duration-200"
                >
                  返回登录
                </button>
              </p>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] tracking-wider text-white/20">
          仅限内部人员使用
        </p>
      </div>
    </div>
  );
}
