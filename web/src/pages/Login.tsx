import { forwardRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { getSavedRole, isLoggedIn, login, resetPassword } from '../services/authService';

// ── 类型定义 ──

interface LoginForm {
  phone: string;
  password: string;
}

interface ResetForm {
  phone: string;
  oldPwd: string;
  newPwd: string;
}

// ── 样式常量 ──

const inputClass =
  'w-full h-12 px-4 rounded-xl text-[15px] text-white placeholder-white/50 ' +
  'outline-none transition-all duration-200 ' +
  'bg-[rgba(0,0,0,0.2)] border border-white/15 ' +
  'focus:border-blue-400/60 focus:bg-[rgba(0,0,0,0.25)]';

// ── 子组件 ──

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

const EyeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10 10 0 0 1 12 5c6.5 0 10 7 10 7a14 14 0 0 1-1.97 2.85" />
    <path d="M6.61 6.61A14 14 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.42-1.03" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} ref={ref} type={visible ? 'text' : 'password'} className={inputClass} />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
      >
        {!visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});

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
      className="w-full h-12 rounded-xl text-[15px] font-semibold transition-all duration-200"
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

function LoginBackground() {
  return (
    <>
      {/* 深蓝渐变背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 30%, #134e8a 60%, #1a6fc4 100%)',
        }}
      />

      {/* 经纬线动画 */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.12]"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <style>{`
          @keyframes login-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .login-orbit { animation: login-spin 45s linear infinite; transform-origin: 400px 400px; }
          .login-orbit-rev { animation: login-spin 60s linear infinite reverse; transform-origin: 400px 400px; }
          @keyframes login-drift-a {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(30px, -20px); }
          }
          @keyframes login-drift-b {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-25px, 15px); }
          }
          .login-glow-a { animation: login-drift-a 12s ease-in-out infinite; }
          .login-glow-b { animation: login-drift-b 15s ease-in-out infinite; }
        `}</style>
        <g className="login-orbit">
          <ellipse
            cx="400"
            cy="400"
            rx="350"
            ry="150"
            fill="none"
            stroke="#fff"
            strokeWidth="1.2"
          />
          <ellipse cx="400" cy="400" rx="300" ry="200" fill="none" stroke="#fff" strokeWidth="1" />
          <ellipse
            cx="400"
            cy="400"
            rx="250"
            ry="300"
            fill="none"
            stroke="#fff"
            strokeWidth="0.8"
          />
        </g>
        <g className="login-orbit-rev">
          <ellipse
            cx="400"
            cy="400"
            rx="380"
            ry="180"
            fill="none"
            stroke="#fff"
            strokeWidth="0.6"
            transform="rotate(60 400 400)"
          />
          <ellipse
            cx="400"
            cy="400"
            rx="320"
            ry="120"
            fill="none"
            stroke="#fff"
            strokeWidth="0.6"
            transform="rotate(-30 400 400)"
          />
        </g>
        <circle cx="400" cy="400" r="360" fill="none" stroke="#fff" strokeWidth="0.5" />
      </svg>

      {/* 光晕 - 缓慢漂移 */}
      <div
        className="absolute w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] rounded-full opacity-25 blur-[100px] login-glow-a"
        style={{
          background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
          top: '5%',
          right: '-5%',
        }}
      />
      <div
        className="absolute w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] rounded-full opacity-20 blur-[80px] login-glow-b"
        style={{
          background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)',
          bottom: '10%',
          left: '-5%',
        }}
      />
    </>
  );
}

// ── 主组件 ──

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetMsg, setResetMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn()) {
      const role = getSavedRole();
      navigate(role === 'admin' ? '/admin' : '/guide', { replace: true });
    }
  }, [navigate]);

  const loginForm = useForm<LoginForm>({ mode: 'onChange' });
  const resetForm = useForm<ResetForm>({ mode: 'onChange' });

  async function handleLogin(data: LoginForm) {
    setError('');
    setLoading(true);
    try {
      const res = await login(data.phone, data.password);
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

  async function handleReset(data: ResetForm) {
    setResetMsg('');
    setLoading(true);
    try {
      const res = await resetPassword(data.phone, data.oldPwd, data.newPwd);
      if (res.success) {
        setResetMsg('密码修改成功，请登录');
        setMode('login');
        loginForm.reset();
        resetForm.reset();
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <LoginBackground />

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
            <h1 className="text-[22px] font-semibold tracking-wide text-white">
              新世纪导游调度系统
            </h1>
            <p className="mt-1.5 text-xs tracking-widest text-white/40">NCTS DISPATCH SYSTEM</p>
          </div>

          {mode === 'login' ? (
            <form
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  loginForm.handleSubmit(handleLogin)();
                }
              }}
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-3.5"
            >
              <div className="space-y-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="tel"
                  placeholder="手机号"
                  {...loginForm.register('phone', {
                    required: true,
                    minLength: 11,
                    maxLength: 11,
                  })}
                  className={inputClass}
                />
                <PasswordInput
                  maxLength={20}
                  autoComplete="current-password"
                  placeholder="密码"
                  {...loginForm.register('password', { required: true })}
                />
              </div>

              {error && <p className="text-[13px] text-red-400 pl-1">{error}</p>}
              {resetMsg && <p className="text-[13px] text-emerald-400 pl-1">{resetMsg}</p>}

              <SubmitButton
                disabled={!loginForm.formState.isValid || loading}
                loading={loading}
                loadingText="登录中"
              >
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
            <form
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  resetForm.handleSubmit(handleReset)();
                }
              }}
              onSubmit={resetForm.handleSubmit(handleReset)}
              className="space-y-3.5"
            >
              <div className="space-y-3">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="tel"
                  placeholder="手机号"
                  {...resetForm.register('phone', {
                    required: true,
                    minLength: 11,
                    maxLength: 11,
                  })}
                  className={inputClass}
                />
                <input
                  type="password"
                  maxLength={20}
                  autoComplete="current-password"
                  placeholder="原密码"
                  {...resetForm.register('oldPwd', { required: true })}
                  className={inputClass}
                />
                <input
                  type="password"
                  maxLength={20}
                  autoComplete="new-password"
                  placeholder="新密码（至少4位）"
                  {...resetForm.register('newPwd', { required: true, minLength: 4 })}
                  className={inputClass}
                />
              </div>

              {resetMsg && <p className="text-[13px] text-red-400 pl-1">{resetMsg}</p>}

              <SubmitButton
                disabled={!resetForm.formState.isValid || loading}
                loading={loading}
                loadingText="提交中"
              >
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
