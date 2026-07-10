"use client"

import { useActionState } from "react"
import Link from "next/link"
import { PiggyBank } from "lucide-react"
import { register } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined)

  return (
    <div className="login-container">
      <div className="login-stage">
        <div className="login-card">
          <div className="login-card-inner">
            <div className="brand-section">
              <div className="brand-icon">
                <PiggyBank className="size-6 text-white" />
              </div>
              <h4>SIKARA</h4>
              <small>Buat Akun Baru</small>
            </div>

            <form action={formAction} className="login-form">
              {state?.error && (
                <div className="login-alert">{state.error}</div>
              )}
              <div className="field-group">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nama lengkap"
                  required
                  className="login-input"
                />
              </div>
              <div className="field-group">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@contoh.com"
                  required
                  className="login-input"
                />
              </div>
              <div className="field-group">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="login-input"
                />
              </div>
              <Button type="submit" disabled={pending} className="login-btn">
                {pending ? "Memproses..." : "Daftar"}
              </Button>
            </form>

            <p className="register-link">
              Sudah punya akun?{" "}
              <Link href="/login">Masuk</Link>
            </p>
          </div>
        </div>
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
          padding: 20px;
        }
        .login-card {
          position: relative;
          width: 380px;
          border-radius: 26px;
          background: #12181f;
          overflow: hidden;
          isolation: isolate;
        }
        .login-card::before {
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
        .login-card::after {
          content: '';
          position: absolute;
          inset: 2px;
          border-radius: 26px;
          background: #12181f;
          z-index: 1;
        }
        @keyframes neon-rotate {
          to { rotate: 360deg; }
        }
        .login-card-inner {
          position: relative;
          z-index: 2;
          padding: 32px 28px 26px;
        }
        .brand-section {
          text-align: center;
          margin-bottom: 22px;
        }
        .brand-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 12px;
          border-radius: 15px;
          background: linear-gradient(135deg, #22d3ee, #0d9488);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(34,211,238,.35);
        }
        .brand-section h4 {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 800;
          font-size: 1.08rem;
          color: #f1f5f9;
          margin: 0 0 2px;
        }
        .brand-section small {
          display: block;
          color: #64748b;
          font-size: .74rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-group label {
          font-size: .72rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .login-input {
          width: 100%;
          box-sizing: border-box;
          background: #0b1220 !important;
          border: 1px solid #1e293b !important;
          border-radius: 12px !important;
          padding: 12px 14px !important;
          color: #f1f5f9 !important;
          font-size: .92rem !important;
          height: auto !important;
          outline: none;
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
        }
        .login-input::placeholder {
          color: #475569 !important;
        }
        .login-input:hover {
          border-color: #334155 !important;
        }
        .login-input:focus {
          border-color: #22d3ee !important;
          box-shadow: 0 0 0 3px rgba(34,211,238,.18) !important;
          transform: scale(1.015);
        }
        .login-btn {
          width: 100%;
          border: none;
          border-radius: 12px;
          padding: 13px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-weight: 700;
          font-size: .88rem;
          color: #0b1220;
          background: linear-gradient(135deg, #22d3ee, #5eead4) !important;
          cursor: pointer;
          margin-top: 6px;
          box-shadow: 0 10px 22px rgba(34,211,238,.28);
          transition: transform .5s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
          height: auto !important;
        }
        .login-btn:hover {
          transform: scale(1.04, 0.94);
          box-shadow: 0 14px 28px rgba(34,211,238,.38);
        }
        .login-btn:active {
          transition: transform .1s ease;
          transform: scale(.95);
        }
        .login-btn:disabled {
          opacity: 0.7;
          transform: none;
        }
        .login-alert {
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.35);
          color: #fca5a5;
          font-size: .78rem;
          border-radius: 10px;
          padding: 10px 12px;
        }
        .register-link {
          text-align: center;
          color: #64748b;
          font-size: .78rem;
          margin-top: 18px;
        }
        .register-link a {
          color: #22d3ee;
          text-decoration: none;
          font-weight: 600;
        }
        .register-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}