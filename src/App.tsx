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
  if (!key) {
    throw new Error("API Key no configurada. Por favor, añade GEMINI_API_KEY en los secretos/variables de entorno.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: key });
  }
  return aiInstance;
};

interface VerseResult {
  verses: { text: string; reference: string }[];
  keywords: string[];
  referenceRange: string;
  version: string;
}

export default function App() {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVerse = async () => {
    if (!book || !chapter || !verseStart) {
      setError("Por favor, completa al menos el libro, capítulo y versículo inicial.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const rangeText = verseEnd ? `desde el versículo ${verseStart} hasta el ${verseEnd}` : `el versículo ${verseStart}`;

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Proporciona el texto de los versículos bíblicos de ${book} capítulo ${chapter}, ${rangeText} en la versión Reina Valera 1960. 
        Además, extrae 3 o 4 palabras clave o conceptos espirituales importantes del texto.
        Responde exclusivamente con un objeto JSON (sin markdown) que tenga la siguiente estructura:
        {
          "verses": [
            { "text": "texto versiculo 1", "reference": "v1" },
            { "text": "texto versiculo 2", "reference": "v2" }
          ],
          "keywords": ["palabra1", "palabra2", "palabra3"],
          "referenceRange": "Libro Capítulo:Inicio-Fin",
          "version": "Reina-Valera 1960"
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.verses && data.verses.length > 0) {
        setResult(data);
      } else {
        throw new Error("No se pudo encontrar el contenido solicitado.");
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Hubo un error al buscar los versículos.");
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
            className="flex flex-wrap items-end justify-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[24px] w-full max-w-5xl"
          >
            <div className="flex-1 min-w-[180px]">
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
            
            <div className="w-20">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold text-center">
                Cap.
              </label>
              <input
                type="text"
                placeholder="3"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-black/30 border border-gold/30 rounded-lg py-3 px-2 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <div className="w-20">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold text-center">
                Desde
              </label>
              <input
                type="text"
                placeholder="16"
                value={verseStart}
                onChange={(e) => setVerseStart(e.target.value)}
                className="w-full bg-black/30 border border-gold/30 rounded-lg py-3 px-2 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <div className="w-20">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold text-center">
                Hasta
              </label>
              <input
                type="text"
                placeholder="(Opc)"
                value={verseEnd}
                onChange={(e) => setVerseEnd(e.target.value)}
                className="w-full bg-black/30 border border-gold/30 rounded-lg py-3 px-2 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center text-xs"
              />
            </div>

            <button
              onClick={fetchVerse}
              disabled={loading}
              className="bg-gold text-dark-bg px-8 py-3.5 rounded-lg font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              Consultar
            </button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-gold/80 text-[11px] uppercase tracking-widest font-medium text-center bg-red-900/20 px-4 py-2 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.p>
          )}
        </section>

        <main className="min-h-[400px] flex flex-col items-center">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.referenceRange}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-4xl"
              >
                {/* Keywords Bar */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                  {result.keywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="px-4 py-1.5 rounded-full border border-gold/20 text-[10px] uppercase tracking-[0.2em] text-gold/60 backdrop-blur-sm"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                <div className="space-y-8 text-center">
                  <div className="relative inline-block px-4">
                    <p className="font-serif text-2xl md:text-3xl leading-relaxed text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] italic max-w-3xl mx-auto">
                      {result.verses.map((v, i) => (
                        <span key={i} className="inline-block hover:text-gold transition-colors duration-300">
                          {v.text} <sup className="text-gold/40 text-[10px] ml-1 mr-2">{v.reference}</sup>
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4 pt-8 border-t border-white/5">
                    <h2 className="text-lg md:text-xl tracking-[0.2em] text-gold uppercase font-medium">
                      {result.referenceRange}
                    </h2>
                    <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.4em] text-gold/40">
                      <Sparkles className="w-3 h-3" />
                      <span>{result.version}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gold/40 flex flex-col items-center gap-4 py-24"
              >
                <div className="p-4 rounded-full border border-gold/10">
                  <Sparkles className="w-8 h-8" />
                </div>
                <p className="text-xs tracking-[0.4em] uppercase text-center">Escribe una referencia para iluminar el camino</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 text-gold py-24"
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
