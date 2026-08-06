'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Module } from '@/types/game';
import { useGameState } from '@/context/GameStateContext';
import { playSfx } from '@/lib/sfx';
import { Swords, Heart, Check, X, Sparkles, ArrowRight } from 'lucide-react';

interface QuizOverlayProps {
  module: Module | null;
  onComplete: (score: number, total: number, faint: boolean) => void;
}

export const QuizOverlay: React.FC<QuizOverlayProps> = ({ module, onComplete }) => {
  const { addCoins, updateFlags, gameState } = useGameState();
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(3);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isHurt, setIsHurt] = useState(false);
  const [isMonsterHit, setIsMonsterHit] = useState(false);
  const [timerPct, setTimerPct] = useState(100);

  const deadlineRef = useRef<number>(0);

  // Timer effect
  useEffect(() => {
    if (!module || isAnswered) return;

    deadlineRef.current = Date.now() + 15000;
    setTimerPct(100);

    const interval = setInterval(() => {
      const left = Math.max(0, deadlineRef.current - Date.now());
      setTimerPct((left / 15000) * 100);

      if (left <= 0) {
        clearInterval(interval);
        handleSelect(-1); // Timeout counts as wrong
      }
    }, 80);

    return () => clearInterval(interval);
  }, [module, qIdx, isAnswered]);

  if (!module) return null;

  const currentQ = module.questions[qIdx];

  const handleSelect = (choiceIdx: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(choiceIdx);

    const isCorrect = choiceIdx === currentQ.a;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setIsMonsterHit(true);
      playSfx('correct');
      setTimeout(() => setIsMonsterHit(false), 500);
    } else {
      setHp((prev) => prev - 1);
      setIsHurt(true);
      playSfx('wrong');
      setTimeout(() => setIsHurt(false), 600);
    }
  };

  const handleNext = () => {
    if (hp <= 0) {
      onComplete(score, module.questions.length, true);
      return;
    }

    if (qIdx < module.questions.length - 1) {
      setQIdx((prev) => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      // Quiz complete
      const total = module.questions.length;
      const perfect = score === total;
      const pr = gameState.progress[module.id] || {};
      const firstClear = !pr.done;

      let coinsEarned = 0;
      if (firstClear) {
        coinsEarned = module.reward;
        addCoins(coinsEarned);
      }

      if (perfect && module.perfectItem) {
        gameState.owned[module.perfectItem] = true;
      }

      gameState.progress[module.id] = {
        ...pr,
        best: Math.max(pr.best || 0, score),
        done: true,
        seen: true,
        perfect: pr.perfect || perfect,
      };

      if (!gameState.flags.quiz) {
        updateFlags({ quiz: true });
      }

      onComplete(score, total, false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-[#241a3a] to-[#120c22] p-4 flex flex-col justify-center items-center select-none transition-all ${
        isHurt ? 'shadow-[inset_0_0_130px_rgba(229,100,63,0.65)]' : ''
      }`}
    >
      <div className="w-full max-w-[560px] h-full max-h-[640px] flex flex-col gap-3">
        {/* Title */}
        <h2 className="text-center font-pixel text-xl text-[#ffd23f] flex items-center justify-center gap-2">
          <Swords className="w-5 h-5 text-[#ffd23f]" />
          <span>A wild {module.mname} appeared!</span>
        </h2>

        {/* Monster */}
        <div
          className={`text-7xl text-center drop-shadow-[0_6px_0_rgba(0,0,0,0.4)] my-1 transition-transform ${
            isMonsterHit ? 'animate-bounce' : ''
          }`}
        >
          {module.monster}
        </div>

        {/* Health Hearts */}
        <div className="flex items-center justify-center gap-2 text-2xl">
          {[0, 1, 2].map((i) => (
            i < hp ? (
              <Heart key={i} className="w-7 h-7 text-red-500 fill-red-500 shrink-0 drop-shadow-md" />
            ) : (
              <Heart key={i} className="w-7 h-7 text-slate-600 shrink-0" />
            )
          ))}
        </div>

        {/* Progress Counter */}
        <div className="text-center font-nunito font-bold text-xs text-[#b9a9e0]">
          Question {qIdx + 1} / {module.questions.length}
        </div>

        {/* 15s Timer Bar */}
        <div className="h-2.5 bg-[#3a2f55] border-2 border-black rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ffd23f] to-[#ff9e3f] transition-all duration-100"
            style={{ width: `${timerPct}%` }}
          />
        </div>

        {/* Question Panel */}
        <div className="flex-1 bg-white/5 border-3 border-[#4a3f70] rounded-2xl p-4 flex flex-col gap-3 overflow-y-auto">
          <p className="text-white text-base font-bold text-center leading-relaxed">
            {currentQ.q}
          </p>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {currentQ.c.map((choiceText, cIdx) => {
              let btnStyle = 'bg-[#2c2348] border-[#4a3f70] text-[#e7defb]';
              if (isAnswered) {
                if (cIdx === currentQ.a) {
                  btnStyle = 'bg-[#1f3a2a] border-[#3fbf6f] text-[#bff0cf]';
                } else if (cIdx === selectedAnswer) {
                  btnStyle = 'bg-[#3a1f1f] border-[#e5643f] text-[#f0c4bf]';
                }
              }

              return (
                <button
                  key={cIdx}
                  disabled={isAnswered}
                  onClick={() => handleSelect(cIdx)}
                  className={`border-3 rounded-xl p-3 text-left font-bold text-sm transition-transform active:scale-95 ${btnStyle}`}
                >
                  <b className="mr-1">{String.fromCharCode(65 + cIdx)}:</b> {choiceText}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next */}
          {isAnswered && (
            <div className="bg-black/30 rounded-xl p-3 mt-2 space-y-2">
              <p className="text-xs text-[#d8cdf0] font-semibold flex items-start gap-1.5">
                {selectedAnswer === currentQ.a ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>
                  {selectedAnswer === currentQ.a ? 'Correct! ' : 'Not quite. '}
                  {currentQ.e}
                </span>
              </p>
              <button
                onClick={handleNext}
                className="cozy-btn cozy-btn-green w-full font-pixel text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <span>{hp <= 0 ? 'See results' : qIdx === module.questions.length - 1 ? 'See results' : 'Next'}</span>
                {hp <= 0 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
