/**
 * Lumina - Sagradas Escrituras
 * Versión estable para Vercel (Sin IA / Sin Keys)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, BookText, Share2, Info } from "lucide-react";

interface Verse {
  number: number;
  text: string;
}

interface VerseResult {
  verses: { text: string; reference: string }[];
  keywords: string[];
  referenceRange: string;
  version: string;
}

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
  const [mounted, setMounted] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const extractKeywords = (text: string) => {
    const words = text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 5 && !STOP_WORDS.has(word));
    
    // Devolver palabras únicas y significativas
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords.sort((a, b) => b.length - a.length).slice(0, 4);
  };

  const fetchVerse = async () => {
    if (!book || !chapter || !verseStart) {
      setError("Indica el libro, capítulo y versículo.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSearchCount(prev => prev + 1);

    try {
      // Normalización flexible
      let cleanBook = book.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      cleanBook = cleanBook.replace(/\s+/g, "");

      const range = verseEnd ? `${verseStart}-${verseEnd}` : verseStart;
      
      // Intentar con múltiples versiones comunes (rvr1960, rv1960, nvi, rva)
      const versions = ['rvr1960', 'rv1960'];
      let lastError = null;

      for (const ver of versions) {
        try {
          const url = `https://bible-api.deno.dev/api/read/${ver}/${cleanBook}/${chapter}/${range}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            processResult(data, book, chapter, range, ver === 'rvr1960' ? "Reina Valera 1960" : "Reina Valera 1960 (Mirror)");
            return; // Éxito
          }
        } catch (e) {
          lastError = e;
        }
      }

      // Si fallan las versiones, intentar capitalizado
      const capitalizedBook = cleanBook.charAt(0).toUpperCase() + cleanBook.slice(1);
      for (const ver of versions) {
        try {
          const url = `https://bible-api.deno.dev/api/read/${ver}/${capitalizedBook}/${chapter}/${range}`;
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            processResult(data, book, chapter, range, ver === 'rvr1960' ? "Reina Valera 1960" : "Reina Valera 1960 (Mirror)");
            return; // Éxito
          }
        } catch (e) {
          lastError = e;
        }
      }

      throw new Error(`Referencia no encontrada: "${book} ${chapter}:${range}". Revisa que el libro esté bien escrito o intenta con otro libro.`);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con la fuente sagrada.");
    } finally {
      setLoading(false);
    }
  };

  const processResult = (data: any, originalBook: string, originalChapter: string, originalRange: string, versionLabel: string) => {
    const versesData = Array.isArray(data) ? data : [data];
    
    // Eliminar posibles duplicados de la API por seguridad
    const uniqueVerses = versesData.filter((v, index, self) => 
      index === self.findIndex((t) => t.number === v.number)
    );

    const verses = uniqueVerses.map((v: any) => ({
      text: v.verse,
      reference: v.number.toString()
    }));

    const fullText = verses.map(v => v.text).join(' ');
    const keywords = extractKeywords(fullText);

    setResult({
      verses,
      keywords: keywords.length > 0 ? keywords : ["ETERNIDAD", "JUSTICIA", "AMOR"],
      referenceRange: `${originalBook.toUpperCase()} ${originalChapter}:${originalRange}`,
      version: versionLabel
    });
  };

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#080a0f] text-[#e0e0e0] font-sans">
      {/* Atmosphere Layer - Recipe 7 Inspired */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#080a0f]" />
        <div className="absolute inset-0 opacity-40 mix-blend-screen bg-[radial-gradient(circle_at_50%_30%,#1a2436_0%,transparent_70%)]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full bg-gold/5" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] blur-[100px] rounded-full bg-blue-900/10" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-12 pb-24 min-h-screen flex flex-col">
        {/* Navigation / Brand */}
        <header className="flex flex-col items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl font-serif italic tracking-[0.5em] text-gold uppercase mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              Lumina
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-gold/20" />
              <p className="text-[10px] tracking-[0.6em] text-gold/40 uppercase font-bold">Sagradas Escrituras</p>
              <div className="h-px w-8 bg-gold/20" />
            </div>
          </motion.div>
        </header>

        {/* Search Engine - Glass Panel */}
        <div className="w-full flex justify-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-1.5 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex flex-wrap md:flex-nowrap items-center gap-2"
          >
            <div className="flex-1 min-w-[150px] relative px-4 py-2">
              <span className="absolute -top-3 left-6 text-[8px] uppercase tracking-widest text-[#666] font-bold px-1">Libro</span>
              <input
                type="text"
                placeholder="Juan..."
                value={book}
                onChange={(e) => setBook(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                className="w-full bg-transparent border-none py-2 outline-none text-white font-serif italic text-lg placeholder:text-white/5"
              />
            </div>
            
            <div className="w-20 md:w-24 border-l border-white/5 relative px-2 py-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-[#666] font-bold px-1 whitespace-nowrap">Cap.</span>
              <input
                type="text"
                placeholder="1"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                className="w-full bg-transparent border-none py-2 text-center outline-none text-white font-bold placeholder:text-white/5"
              />
            </div>

            <div className="w-20 md:w-24 border-l border-white/5 relative px-2 py-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-[#666] font-bold px-1 whitespace-nowrap">Vers.</span>
              <input
                type="text"
                placeholder="1"
                value={verseStart}
                onChange={(e) => setVerseStart(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                className="w-full bg-transparent border-none py-2 text-center outline-none text-gold font-black placeholder:text-white/5"
              />
            </div>

            <div className="w-20 md:w-24 border-l border-white/5 relative px-2 py-2">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-widest text-[#666] font-bold px-1 whitespace-nowrap">Hasta</span>
              <input
                type="text"
                placeholder="..."
                value={verseEnd}
                onChange={(e) => setVerseEnd(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchVerse()}
                className="w-full bg-transparent border-none py-2 text-center outline-none text-white/30 text-xs placeholder:text-white/5"
              />
            </div>

            <button
              onClick={fetchVerse}
              disabled={loading}
              className="bg-gold hover:brightness-110 text-[#080a0f] h-14 w-14 md:h-16 md:w-24 rounded-[32px] flex items-center justify-center transition-all active:scale-95 disabled:opacity-20 shadow-[0_0_20px_rgba(212,175,55,0.2)] group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" /> }
            </button>
          </motion.div>
        </div>

        {/* Display Area */}
        <main className="flex-1 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error-message"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/5 border border-red-500/20 px-8 py-3 rounded-full text-red-500 text-[10px] uppercase tracking-[0.2em] font-black mb-12 backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {result ? (
              <motion.div
                key={`result-${result.referenceRange}-${searchCount}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {/* Spiritual Pillars (Keywords) */}
                <div className="flex flex-wrap justify-center gap-6 mb-20">
                  {result.keywords.map((kw, i) => (
                    <motion.div
                      key={`kw-${kw}-${i}-${searchCount}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="text-[9px] uppercase tracking-[0.6em] text-gold font-black border-b border-gold/10 pb-1.5"
                    >
                      {kw}
                    </motion.div>
                  ))}
                </div>

                {/* Holy Text */}
                <div className="text-center space-y-16">
                  <div className="relative">
                    <p className="font-serif italic text-3xl md:text-5xl leading-[1.6] text-white/95 selection:bg-gold/30 max-w-5xl mx-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      {result.verses.map((v, i) => (
                        <span key={`verse-${v.reference}-${i}`} className="inline-block px-1.5 transition-all duration-700 hover:text-gold hover:scale-[1.02] cursor-default">
                          {v.text}
                          <sup className="text-gold/40 text-xs ml-1 font-sans not-italic font-bold select-none">{v.reference}</sup>
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-8 pt-20">
                    <div className="w-12 h-px bg-gold/10" />
                    <div className="space-y-4">
                      <h2 className="text-2xl md:text-3xl tracking-[0.5em] text-gold uppercase font-serif italic drop-shadow-lg">
                        {result.referenceRange}
                      </h2>
                      <div className="flex items-center justify-center gap-4 text-[9px] uppercase tracking-[0.7em] text-white/10 font-black">
                        <div className="h-px w-4 bg-white/5" />
                        <BookText className="w-3 h-3" />
                        <span>{result.version}</span>
                        <div className="h-px w-4 bg-white/5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro Actions */}
                <div className="flex justify-center gap-10 mt-24 opacity-10 hover:opacity-40 transition-opacity duration-1000">
                   <button className="flex items-center gap-3 text-[9px] uppercase tracking-widest hover:text-gold transition-colors">
                     <Share2 className="w-3.5 h-3.5" /> Compartir
                   </button>
                   <button className="flex items-center gap-3 text-[9px] uppercase tracking-widest hover:text-gold transition-colors">
                     <Info className="w-3.5 h-3.5" /> Detalles
                   </button>
                </div>
              </motion.div>
            ) : !loading && !error ? (
              <motion.div
                key="welcome-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                className="flex flex-col items-center gap-8 py-32 cursor-default select-none"
              >
                <div className="relative">
                   <Sparkles className="w-16 h-16 text-gold animate-[pulse_5s_infinite]" />
                   <div className="absolute inset-0 blur-[60px] bg-gold/30 rounded-full" />
                </div>
                <p className="text-[10px] tracking-[0.9em] uppercase font-black text-gold">Escudriñad las Escrituras</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>

        <footer className="mt-auto pt-16 border-t border-white/[0.02] text-center">
           <p className="text-[9px] tracking-[0.8em] text-white/5 uppercase font-black">
             Lumina • In Perpetuum • RVR1960
           </p>
        </footer>
      </div>
    </div>
  );
}
