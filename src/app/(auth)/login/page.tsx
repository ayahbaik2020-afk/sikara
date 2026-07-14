"use client"

import { useState, useRef, useEffect } from "react"
import { useActionState } from "react"
import Image from "next/image"
import { Lock } from "lucide-react"
import { login } from "@/features/auth/actions"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined)
  const [open, setOpen] = useState(false)
  const shellRef = useRef<HTMLDivElement>(null)
  const usernameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => usernameRef.current?.focus(), 260)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout>

    const onEnter = () => {
      clearTimeout(timer)
      setOpen(true)
    }
    const onLeave = () => {
      timer = setTimeout(() => {
        if (!el.contains(document.activeElement)) setOpen(false)
      }, 280)
    }
    const onFocusIn = () => setOpen(true)
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node)) {
        timer = setTimeout(() => setOpen(false), 280)
      }
    }
    const onClick = () => {
      if (!open) {
        setOpen(true)
        setTimeout(() => usernameRef.current?.focus(), 260)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !open) {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => usernameRef.current?.focus(), 260)
      }
    }

    el.addEventListener("mouseenter", onEnter)
    el.addEventListener("mouseleave", onLeave)
    el.addEventListener("focusin", onFocusIn)
    el.addEventListener("focusout", onFocusOut as EventListener)
    el.addEventListener("click", onClick)
    el.addEventListener("keydown", onKey)

    return () => {
      el.removeEventListener("mouseenter", onEnter)
      el.removeEventListener("mouseleave", onLeave)
      el.removeEventListener("focusin", onFocusIn)
      el.removeEventListener("focusout", onFocusOut as EventListener)
      el.removeEventListener("click", onClick)
      el.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div className="login-container">
      <div className="login-stage">
        <div
          ref={shellRef}
          tabIndex={0}
          role="button"
          aria-label="Buka form login"
          className={cn("login-shell", open && "is-open")}
        >
          <div className="pill-face">
            <Lock className="size-3.5" />
            Masuk
          </div>

          <div className="card-face">
            <div className="brand-icon">
              <Image src="/logo-sikaraman.png" alt="SIKARA" width={44} height={44} className="brand-icon-img" />
            </div>
            <h4>SIKARA</h4>
            <small>Sistem Keuangan Keluarga</small>

            <form action={formAction} className="login-form">
              {state?.error && <div className="login-alert">{state.error}</div>}
              <div className="field-group">
                <label htmlFor="username">Username</label>
                <input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="ayah / ibu / anak"
                  className="login-input"
                  autoComplete="username"
                />
              </div>
              <div className="field-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="********"
                  className="login-input"
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" disabled={pending} className="login-btn">
                {pending ? "Memproses..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
        <p className="stage-hint">Arahkan kursor atau ketuk untuk membuka</p>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 28% 22%, #1e293b, #0b1220 62%);
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
        }
        .login-stage {
          position: relative;
          padding: 40px;
        }
        .login-shell {
          position: relative;
          width: 230px;
          height: 58px;
          border-radius: 999px;
          background: #12181f;
          box-shadow: 0 14px 34px rgba(0,0,0,.55);
          overflow: hidden;
          cursor: pointer;
          isolation: isolate;
          transition: width .55s cubic-bezier(.2,.9,.15,1.05),
                      height .55s cubic-bezier(.2,.9,.15,1.05),
                      border-radius .5s ease;
        }
        .login-shell.is-open {
          width: 380px;
          height: auto;
          min-height: 468px;
          border-radius: 26px;
          cursor: default;
        }
        @media (max-width: 420px) {
          .login-shell.is-open { width: 88vw; }
        }
        .login-shell::before {
          content: '';
          position: absolute;
          inset: 50%;
          width: 560px;
          height: 560px;
          translate: -50% -50%;
          background: conic-gradient(from 0deg,
            transparent 0deg 36deg,
            #22d3ee 36deg 48deg,
            transparent 48deg 126deg,
            #0d9488 126deg 138deg,
            transparent 138deg 216deg,
            #22d3ee 216deg 228deg,
            transparent 228deg 306deg,
            #0d9488 306deg 318deg,
            transparent 318deg 360deg
          );
          filter: blur(1px) drop-shadow(0 0 10px rgba(34,211,238,.55));
          animation: neon-rotate 6s linear infinite;
          z-index: 0;
        }
        .login-shell::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: inherit;
          background: #12181f;
          z-index: 1;
        }
        @keyframes neon-rotate {
          to { rotate: 360deg; }
        }
        .pill-face {
          position: absolute; inset: 0; z-index: 3;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          color: #e2e8f0; font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: .82rem; letter-spacing: .09em; text-transform: uppercase;
          opacity: 1; transition: opacity .3s ease .15s;
          pointer-events: none;
        }
        .login-shell.is-open .pill-face { opacity: 0; transition-delay: 0s; }
        .card-face {
          position: relative; z-index: 2;
          padding: 32px 28px 26px;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity .4s ease, transform .4s ease;
        }
        .login-shell.is-open .card-face { opacity: 1; transform: translateY(0); transition-delay: .22s; }
        .brand-icon {
          width: 72px; height: 72px; margin: 0 auto 22px;
          padding: 14px;
          border-radius: 24px;
          background: linear-gradient(135deg, #10b981, #22d3ee);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 12px 28px rgba(16,185,129,.32), 0 4px 12px rgba(34,211,238,.22);
          opacity: 0;
          transform: scale(.82);
        }
        .login-shell.is-open .brand-icon {
          animation: brand-icon-in .55s cubic-bezier(.2,.9,.15,1.05) .3s forwards;
        }
        @keyframes brand-icon-in {
          to { opacity: 1; transform: scale(1); }
        }
        .brand-icon-img {
          width: 100%; height: 100%;
          object-fit: contain;
        }
        .card-face h4 {
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; font-size: 1.08rem;
          color: #f1f5f9; text-align: center; margin: 0 0 2px;
        }
        .card-face small {
          display: block; text-align: center; color: #64748b; font-size: .74rem; margin-bottom: 22px;
        }
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group label {
          font-size: .72rem; font-weight: 600; color: #94a3b8;
          text-transform: uppercase; letter-spacing: .05em;
        }
        .login-input {
          width: 100%; box-sizing: border-box;
          background: #0b1220; border: 1px solid #1e293b; border-radius: 12px;
          padding: 12px 14px; color: #f1f5f9; font-size: .92rem; font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
        }
        .login-input::placeholder { color: #475569; }
        .login-input:hover { border-color: #334155; }
        .login-input:focus {
          border-color: #22d3ee;
          box-shadow: 0 0 0 3px rgba(34,211,238,.18);
          transform: scale(1.015);
        }
        .login-btn {
          width: 100%; border: none; border-radius: 12px; padding: 13px;
          font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; font-size: .88rem;
          color: #0b1220; letter-spacing: .02em;
          background: linear-gradient(135deg, #22d3ee, #5eead4);
          cursor: pointer; margin-top: 6px;
          box-shadow: 0 10px 22px rgba(34,211,238,.28);
          transition: transform .5s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
        }
        .login-btn:hover { transform: scale(1.08, 0.92); box-shadow: 0 14px 28px rgba(34,211,238,.38); }
        .login-btn:active { transition: transform .1s ease; transform: scale(.95); }
        .login-btn:disabled { opacity: .7; transform: none; }
        .login-alert {
          background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.35);
          color: #fca5a5; font-size: .78rem; border-radius: 10px; padding: 10px 12px;
        }
        .stage-hint {
          text-align: center; color: #475569; font-size: .74rem; margin-top: 18px;
          font-family: 'Inter', sans-serif;
        }
        @media (prefers-reduced-motion: reduce) {
          .login-shell { transition-duration: .01ms !important; }
          .login-shell::before { animation-duration: .01ms !important; }
          .login-shell.is-open .brand-icon { animation-duration: .01ms !important; opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}