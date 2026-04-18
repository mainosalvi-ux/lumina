/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { Search, Loader2, Sparkles, BookText } from "lucide-react";

interface Verse {
  number: number;
  text: string;
}

interface BibleData {
  book: string;
  chapter: number;
  versiculous: Verse[];
}

interface VerseResult {
  verses: { text: string; reference: string }[];
  keywords: string[];
  referenceRange: string;
  version: string;
}

// Lista de palabras comunes en español que ignoraremos para las palabras clave
const STOP_WORDS = new Set([
  'que', 'los', 'las', 'del', 'con', 'por', 'para', 'una', 'uno', 'unos', 
  'donde', 'cuando', 'quien', 'como', 'pero', 'entonces', 'sobre', 'este', 
  'esta', 'estos', 'estas', 'entre', 'todo', 'todos', 'toda', 'todas',
  'porque', 'pues', 'aunque', 'aquí', 'allá', 'ante', 'bajo', 'cabe',
  'desde', 'hacia', 'hasta', 'según', 'vuestro', 'nuestro', 'suya', 'suyo'
]);

export default function App() {
  const [book, setBook] = useState('');
  const [chapter, setChapter] = useState('');
  const [verseStart, setVerseStart] = useState('');
  const [verseEnd, setVerseEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Función simple para extraer palabras clave del texto
  const extractKeywords = (text: string) => {
    const words = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 4 && !STOP_WORDS.has(word));
    
    // Contar frecuencia o simplemente devolver las más largas/únicas
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.sort((a, b) => b.length - a.length).slice(0, 4);
  };

  const fetchVerse = async () => {
    if (!book || !chapter || !verseStart) {
      setError("Por favor, completa al menos el libro, capítulo y versículo inicial.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Limpiar el nombre del libro para la API
      const cleanBook = book.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      // Llamar a una API pública que no requiere Key
      const url = `https://bible-api.deno.dev/api/read/rvr1960/${cleanBook}/${chapter}/${verseStart}${verseEnd ? `-${verseEnd}` : ''}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Referencia no encontrada. Revisa el libro y números.");
      
      const data = await response.json();
      
      // La API devuelve un array si es rango, o un objeto si es uno solo
      const versesData = Array.isArray(data) ? data : [data];
      
      const verses = versesData.map((v: any) => ({
        text: v.verse,
        reference: v.number.toString()
      }));

      const fullText = verses.map(v => v.text).join(' ');
      const keywords = extractKeywords(fullText);

      setResult({
        verses,
        keywords: keywords.length > 0 ? keywords : ["FE", "VIDA", "PAZ"],
        referenceRange: `${book.toUpperCase()} ${chapter}:${verseStart}${verseEnd ? `-${verseEnd}` : ''}`,
        version: "Reina Valera 1960"
      });

    } catch (err) {
      console.error(err);
      setError("No pudimos encontrar esos versículos. Prueba con: Juan 3 16");
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <span className="font-serif italic text-3xl md:text-4xl tracking-[0.4em] text-gold uppercase drop-shadow-lg">
              Lumina
            </span>
            <div className="text-[10px] tracking-[0.6em] text-gold/40 uppercase font-bold mt-1">Escrituras Offline</div>
          </motion.div>
        </header>

        {/* Controls Panel */}
        <section className="mb-16 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-end justify-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[32px] w-full max-w-5xl shadow-2xl"
          >
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold">Libro</label>
              <input
                type="text"
                placeholder="Ej. Juan"
                value={book}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                onChange={(e) => setBook(e.target.value)}
                className="w-full bg-black/40 border border-gold/20 rounded-xl py-3 px-4 text-white focus:border-gold outline-none transition-all placeholder:text-white/20"
              />
            </div>
            
            <div className="w-24">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold text-center">Cap.</label>
              <input
                type="text"
                placeholder="3"
                value={chapter}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full bg-black/40 border border-gold/20 rounded-xl py-3 px-2 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <div className="w-24">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold text-center">Desde</label>
              <input
                type="text"
                placeholder="16"
                value={verseStart}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                onChange={(e) => setVerseStart(e.target.value)}
                className="w-full bg-black/40 border border-gold/20 rounded-xl py-3 px-2 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <div className="w-24">
              <label className="block text-[10px] uppercase tracking-widest text-[#888] mb-2 font-bold text-center">Hasta</label>
              <input
                type="text"
                placeholder="(Opc)"
                value={verseEnd}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                onChange={(e) => setVerseEnd(e.target.value)}
                className="w-full bg-black/40 border border-gold/20 rounded-xl py-3 px-2 text-white focus:border-gold outline-none transition-all placeholder:text-white/20 text-center"
              />
            </div>

            <button
              onClick={fetchVerse}
              disabled={loading}
              className="bg-gold text-dark-bg px-10 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              Consultar
            </button>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-gold text-[10px] uppercase tracking-[0.2em] font-bold text-center bg-red-900/40 px-6 py-2.5 rounded-full border border-red-500/30"
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
                transition={{ duration: 1, ease: "circOut" }}
                className="w-full max-w-4xl"
              >
                {/* Keywords Bar */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                  {result.keywords.map((kw, i) => (
                    <motion.span 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-6 py-2 rounded-lg bg-gold/5 border border-gold/10 text-[10px] uppercase tracking-[0.3em] text-gold/80 font-bold"
                    >
                      {kw}
                    </motion.span>
                  ))}
                </div>

                <div className="space-y-12 text-center">
                  <div className="relative inline-block px-4">
                    <p className="font-serif text-2xl md:text-4xl leading-relaxed text-white drop-shadow-2xl italic max-w-4xl mx-auto selection:bg-gold selection:text-black">
                      {result.verses.map((v, i) => (
                        <span key={i} className="inline-block px-1">
                          {v.text} <sup className="text-gold/50 text-xs ml-1 mr-3 font-sans not-italic font-bold">{v.reference}</sup>
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 pt-12 border-t border-gold/10">
                    <div className="p-3 rounded-full border border-gold/20">
                      <BookText className="w-6 h-6 text-gold/60" />
                    </div>
                    <h2 className="text-2xl md:text-3xl tracking-[0.3em] text-gold uppercase font-serif italic">
                      {result.referenceRange}
                    </h2>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold">
                      <div className="h-px w-8 bg-gold/20" />
                      <span>{result.version}</span>
                      <div className="h-px w-8 bg-gold/20" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gold/30 flex flex-col items-center gap-6 py-32"
              >
                <div className="p-6 rounded-full border border-gold/5 animate-pulse">
                  <Sparkles className="w-12 h-12" />
                </div>
                <p className="text-xs tracking-[0.6em] uppercase text-center font-bold">Revela la verdad eterna</p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-6 py-32 text-gold"
            >
              <div className="relative">
                <Loader2 className="w-12 h-12 animate-spin opacity-40" />
                <div className="absolute inset-0 blur-xl bg-gold/30 rounded-full animate-pulse" />
              </div>
              <p className="text-[10px] tracking-[0.5em] uppercase opacity-40 font-bold">Accediendo a la Fuente...</p>
            </motion.div>
          )}
        </main>

        <footer className="mt-24 text-center">
          <p className="text-[10px] tracking-[0.4em] text-white/20 uppercase font-black">
            Lumina • RVR1960 • Sin IA • Funciona en todo lugar
          </p>
        </footer>
      </div>
    </div>
  );
}
