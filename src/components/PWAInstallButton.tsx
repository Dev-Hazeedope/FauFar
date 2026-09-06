import React, { useState, useEffect } from 'react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // We want to keep prompting the user if they haven't installed it
  // and haven't explicitly dismissed it for this session.
  // Note: BeforeInstallPrompt on Android/Chrome will naturally only fire
  // when the browser allows it, but we can show our custom UI whenever it's available.

  if (isInstalled || dismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (isInstallable || isIOS) {
    return (
      <>
        <AnimatePresence>
          {!showIOSGuide && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100, delay: 1.5 }}
              className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-safe pointer-events-none"
            >
              <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex flex-col gap-4 pointer-events-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Install FauFar Games</h3>
                    <p className="text-slate-500 text-sm">Add to your home screen for full-screen play and offline access.</p>
                  </div>
                  <button 
                    onClick={() => setDismissed(true)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] transition-all"
                >
                  <Download className="w-5 h-5" />
                  Get the App
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showIOSGuide && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                <h3 className="text-xl font-black text-slate-900 mb-4">Install on iPhone</h3>
                <div className="space-y-4 text-slate-600 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700 shrink-0">
                      <Share className="w-5 h-5" />
                    </div>
                    <p className="pt-2 text-sm leading-relaxed">1. Tap the <strong>Share</strong> button in the Safari toolbar below.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700 shrink-0">
                      <PlusSquare className="w-5 h-5" />
                    </div>
                    <p className="pt-2 text-sm leading-relaxed">2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
};
