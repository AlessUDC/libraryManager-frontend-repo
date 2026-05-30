import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XMarkIcon } from '@heroicons/react/24/outline';

type BarcodeScannerProps = {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
};

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    // Wait a bit for the DOM to render the div
    const timer = setTimeout(() => {
      try {
        const html5QrcodeScanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 150 }, rememberLastUsedCamera: true },
          /* verbose= */ false
        );

        html5QrcodeScanner.render(
          (decodedText) => {
            html5QrcodeScanner.clear().catch(console.error);
            onScan(decodedText);
            onClose();
          },
          () => {
            // we don't want to show every scan failure, it's normal until it catches a barcode
            // console.warn(err);
          }
        );

        return () => {
          html5QrcodeScanner.clear().catch(console.error);
        };
      } catch (e: any) {
        setError(e.message || 'Error al iniciar la cámara.');
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-white">Escanear Código</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="text-red-400 bg-red-500/10 p-4 rounded-xl text-center font-medium">
            {error}
          </div>
        ) : (
          <div className="w-full bg-black rounded-2xl overflow-hidden border border-slate-800 relative min-h-[300px]">
            <div id="reader" className="w-full" />
          </div>
        )}

        <p className="text-center text-slate-500 text-xs mt-6 font-bold uppercase tracking-widest">
          Apunta la cámara al código de barras del ejemplar
        </p>
      </div>
    </div>
  );
}
