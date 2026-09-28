import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';

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
      {/* Sleek Install Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.2))',
        border: '1px solid var(--border-highlight)',
        borderRadius: '12px',
        padding: '0.65rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '1rem',
        fontSize: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b, #8b5cf6)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Smartphone size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
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
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', minHeight: '34px' }}
          >
            <Download size={14} />
            <span>نصب روی گوشی</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="btn-ghost"
            style={{ padding: '0.35rem', borderRadius: '6px' }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="modal-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>راهنمای نصب روی آیفون (iOS)</h3>
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
        </div>
      )}
    </>
  );
}
