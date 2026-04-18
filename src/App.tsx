/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Search, Loader2, Sparkles } from "lucide-react";

// Lazy initialization of Gemini API
let aiInstance: GoogleGenAI | null = null;
const getAI = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    throw new Error("Falta la API Key de Gemini. Configúrala en las variables de entorno como GEMINI_API_KEY.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

interface VerseResult {
  text: string;
  reference: string;
  version: string;
}

export default function App() {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = async () => {
    if (!book || !chapter || !verse) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Proporciona el texto del versículo bíblico: ${book} ${chapter}:${verse} en la versión Reina Valera 1960. 
        Responde exclusivamente con un objeto JSON (sin markdown) que tenga la siguiente estructura:
        {
          "text": "el texto del versículo aqui",
          "reference": "Libro Capítulo:Versículo",
          "version": "Reina-Valera 1960"
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.text) {
        setResult(data);
      } else {
        throw new Error("No se pudo encontrar el versículo.");
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Hubo un error al buscar el versículo. Asegúrate de tener una API Key válida y que la referencia sea correcta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden pt-12 pb-24 font-sans selection:bg-gold/30">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_50%_20%,#1a2436_0%,#080a0f_70%)]" />
      
      {/* Spotlight Effect */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] z-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.15)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Header */}
        <header className="flex justify-center items-center py-8 mb-8 border-b border-gold/20">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-serif italic text-2xl md:text-3xl tracking-[0.3em] text-gold uppercase">
              Lumina
            </span>
            <div className="w-12 h-0.5 bg-gold/30" />
          </motion.div>
        </header>

        {/* Controls Panel */}
        <section className="mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-end justify-center gap-6 bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[24px] w-full max-w-4xl"
          >
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold">
                Libro
              </label>
              <input
                type="text"
                placeholder="Ej. Juan"
                value={book}
                onChange={(e) => setBook(e.target.value)}
                className="w-full bg-black/30 border border-gold/30 rounded-lg py-3 px-4 text-white focus:border-gold outline-none transition-all placeholder:text-white/20"
              />
            </div>
            
            <div className="w-24">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold">
                Capítulo
              </label>
              <input
                type="text"
                placeholder="3"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-black/30 border border-gold/30 rounded-lg py-3 px-4 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <div className="w-24">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold">
                Versículo
              </label>
              <input
                type="text"
                placeholder="16"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                className="w-full bg-black/30 border border-gold/30 rounded-lg py-3 px-4 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <button
              onClick={fetchVerse}
              disabled={loading}
              className="bg-gold text-dark-bg px-10 py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              Consultar
            </button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-gold/80 text-[11px] uppercase tracking-widest font-medium"
            >
              !! {error} !!
            </motion.p>
          )}
        </section>

        <main className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.reference}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="verse-display max-w-3xl"
              >
                <h2 className="font-serif text-3xl md:text-5xl leading-relaxed text-white mb-8 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] italic">
                  “{result.text}”
                </h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-8 bg-gold/20" />
                  <p className="text-sm md:text-base tracking-[0.2em] text-gold opacity-80 uppercase font-medium">
                    {result.reference} — {result.version}
                  </p>
                  <div className="h-px w-8 bg-gold/20" />
                </div>
              </motion.div>
            ) : !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gold/40 flex flex-col items-center gap-4 py-12"
              >
                <div className="p-4 rounded-full border border-gold/10">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="text-xs tracking-[0.4em] uppercase">Busca la luz en las escrituras</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 text-gold py-12"
            >
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin opacity-50" />
                <div className="absolute inset-0 blur-md bg-gold/20 rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] tracking-[0.3em] uppercase opacity-60">Consultando Lumina...</p>
            </motion.div>
          )}
        </main>

        {/* Footer Hint */}
        <footer className="mt-24 text-center">
          <p className="text-[11px] tracking-[0.2em] text-white/30 uppercase font-light">
            Explora la sabiduría milenaria en alta definición
          </p>
        </footer>
      </div>
    </div>
  );
}
