'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2, Sparkles, MoreVertical } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isRunningStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isRunningStandalone);

    if (isRunningStandalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom trigger from any button (navbar, drawer, footer)
    const handleManualTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choice) => {
          if (choice.outcome === 'accepted') {
            setShowBanner(false);
            setDeferredPrompt(null);
          }
        });
      } else if (isIosDevice) {
        setShowIOSModal(true);
      } else {
        setShowAndroidModal(true);
      }
    };

    window.addEventListener('cosecha_trigger_install', handleManualTrigger);

    // Always show banner after 1.5 seconds if not dismissed in this session
    const dismissed = sessionStorage.getItem('cosecha_install_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowBanner(true), 1200);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('cosecha_trigger_install', handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setShowBanner(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        setShowAndroidModal(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowAndroidModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('cosecha_install_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Install Notification */}
      {showBanner && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-emerald-500/40 flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shrink-0 shadow-md">
              <Download className="w-5 h-5 text-stone-900 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-100">
                <span>Instalar en tu Celular</span>
                <span className="text-[9px] bg-amber-400 text-stone-900 font-black px-1.5 py-0.5 rounded-full uppercase">
                  Gratis
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200/90 mt-0.5 leading-snug">
                Pide frutas y verduras en 1 toque desde tu pantalla de inicio, sin ocupar memoria.
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Instalar ahora</span>
                </button>
                <button
                  onClick={dismissBanner}
                  className="text-xs text-emerald-300 hover:text-white px-2 py-1.5 transition-colors cursor-pointer"
                >
                  Ahora no
                </button>
              </div>
            </div>

            <button
              onClick={dismissBanner}
              className="text-emerald-300 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Android & Chrome Instructions Modal */}
      {showAndroidModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-stone-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-base">Instalar en tu Celular</h3>
              </div>
              <button
                onClick={() => setShowAndroidModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <p className="leading-relaxed">
                  Toca el menú de <strong className="text-stone-900">3 puntos ( <MoreVertical className="w-3.5 h-3.5 inline text-emerald-700" /> )</strong> en la esquina superior derecha de tu navegador Chrome.
                </p>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <p className="leading-relaxed">
                  Selecciona la opción <strong className="text-stone-900">&quot;Instalar aplicación&quot;</strong> o <strong className="text-stone-900">&quot;Agregar a la pantalla principal&quot;</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Listo! Ya tendrás el ícono de La Cosecha en tu pantalla.</span>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl cursor-pointer text-xs shadow-md transition"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-stone-800 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-stone-900 text-base">Instalar en tu iPhone</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <p className="leading-relaxed">
                  Toca el botón <strong className="text-stone-900">Compartir</strong> de Safari en la barra inferior (el ícono de cuadrado con flecha hacia arriba <Share className="w-3.5 h-3.5 inline text-emerald-600" />).
                </p>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <p className="leading-relaxed">
                  Baja en el menú y presiona <strong className="text-stone-900">&quot;Agregar a pantalla de inicio&quot;</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Listo! Tendrás La Cosecha en tu pantalla de inicio.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl cursor-pointer text-xs shadow-md transition"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
