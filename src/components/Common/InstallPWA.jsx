import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Download, X, Share2, PlusSquare } from 'lucide-react';
import { PaintingIcon } from './PaintingIcon';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }

    // Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed event
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (isDismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  return (
    <>
      {/* Sleek Install Banner with Official Painting Icon */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(139, 92, 246, 0.15))',
        border: '1px solid var(--border-highlight)',
        borderRadius: '14px',
        padding: '0.75rem 1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1rem',
        fontSize: '0.85rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
            flexShrink: 0
          }}>
            <PaintingIcon size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              نصب وب‌اپلیکیشن «کارگاه» روی گوشی
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              دسترسی سریع و بدون نیاز به ورود مجدد به مرورگر
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleInstallClick}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', minHeight: '34px' }}
          >
            <Download size={14} />
            <span>نصب روی گوشی</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="btn-ghost"
            style={{ padding: '0.35rem', borderRadius: '6px' }}
            title="بستن"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <PaintingIcon size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>راهنمای نصب وب‌اپلیکیشن «کارگاه»</h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="btn-ghost" style={{ padding: '0.3rem' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              برای افزودن برنامه به صفحه اصلی آیفون، مراحل زیر را در مرورگر Safari انجام دهید:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <Share2 size={18} color="var(--accent-gold)" />
                <span>۱. دکمه اشتراک‌گذاری (<strong>Share</strong>) را در پایین صفحه Safari لمس کنید.</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}>
                <PlusSquare size={18} color="#34d399" />
                <span>۲. گزینه <strong>Add to Home Screen</strong> (افزودن به صفحه اصلی) را انتخاب کنید.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              متوجه شدم
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
