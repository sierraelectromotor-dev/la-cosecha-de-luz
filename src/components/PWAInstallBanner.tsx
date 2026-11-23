'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, CheckCircle2, Sparkles } from 'lucide-react';

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

  useEffect(() => {
    // Check if already in standalone mode
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches ||
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
      // Check if user previously closed banner recently
      const dismissed = sessionStorage.getItem('cosecha_install_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, if not standalone, show prompt after 2 seconds
    if (isIosDevice) {
      const dismissed = sessionStorage.getItem('cosecha_install_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions
      alert('Para instalar: presiona el menú de 3 puntos en tu navegador y selecciona "Instalar aplicación" o "Agregar a la pantalla principal".');
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    sessionStorage.setItem('cosecha_install_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom / Header Install Notification */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/40">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-100">
                <span>Acceso Directo en tu Celular</span>
                <span className="text-[10px] bg-amber-400 text-stone-900 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  Gratis
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Pide tus frutas y verduras en 1 solo toque desde tu pantalla de inicio, sin ocupar espacio.
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={handleInstallClick}
                  className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
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

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-stone-800 animate-in zoom-in-95 duration-200">
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

            <div className="mt-4 space-y-4 text-sm text-stone-600">
              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <p>
                  Toca el botón <strong className="text-stone-900">Compartir</strong> de Safari en la barra inferior (el ícono de cuadrado con flecha hacia arriba <Share className="w-4 h-4 inline text-emerald-600" />).
                </p>
              </div>

              <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <p>
                  Baja en el menú y selecciona <strong className="text-stone-900">&quot;Agregar a pantalla de inicio&quot;</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Listo! Ya tendrás el ícono de La Cosecha en tu pantalla.</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl cursor-pointer text-sm shadow transition"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
