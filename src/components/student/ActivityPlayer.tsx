import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  Gem,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
} from 'lucide-react';
import { ActivityItem, AnyQuestion, AttemptAnswer, AttemptRecord } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/sound';
import { dbService } from '../../services/db';

// Game components
import { MultipleChoiceGame } from '../games/MultipleChoiceGame';
import { TrueFalseGame } from '../games/TrueFalseGame';
import { MatchingGame } from '../games/MatchingGame';
import { FillInTheBlanksGame } from '../games/FillInTheBlanksGame';
import { StepOrderingGame } from '../games/StepOrderingGame';
import { VisualIdentificationGame } from '../games/VisualIdentificationGame';
import { TimedQuizGame } from '../games/TimedQuizGame';
import { ErrorCorrectionGame } from '../games/ErrorCorrectionGame';
import { ShortcutChallengeGame } from '../games/ShortcutChallengeGame';
import { PracticalSimulatorGame } from '../games/PracticalSimulatorGame';
import { OpenQuestionGame } from '../games/OpenQuestionGame';
import { MemoryGame } from '../games/MemoryGame';

interface ActivityPlayerProps {
  activity: ActivityItem;
  onClose: () => void;
  onFinish?: () => void;
}

export const ActivityPlayer: React.FC<ActivityPlayerProps> = ({ activity, onClose, onFinish }) => {
  const { currentUser, updateUserXpAndStreak, loseHeart } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [currentAnswered, setCurrentAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);

  // Flatten questions if final_boss or standard
  const questions: AnyQuestion[] = React.useMemo(() => {
    if (activity.gameType === 'final_boss' && activity.questions.length > 0) {
      const boss = activity.questions[0];
      if ('subQuestions' in boss && Array.isArray(boss.subQuestions)) {
        return boss.subQuestions;
      }
    }
    return activity.questions;
  }, [activity]);

  const currentQuestion = questions[currentIndex];
  const progressPercent = ((currentIndex) / questions.length) * 100;

  const handleQuestionAnswer = (isCorrect: boolean, summary: string) => {
    if (currentAnswered) return;
    setCurrentAnswered(true);
    setLastAnswerCorrect(isCorrect);

    if (isCorrect) {
      soundService.playCorrect();
    } else {
      soundService.playIncorrect();
      loseHeart();
    }

    const record: AttemptAnswer = {
      questionId: currentQuestion.id,
      prompt: currentQuestion.prompt,
      isCorrect,
      userAnswer: summary,
    };
    setAnswers(prev => [...prev, record]);
  };

  const handleNextQuestion = () => {
    soundService.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentAnswered(false);
    } else {
      finishActivity();
    }
  };

  const finishActivity = async () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    setTimeSpentSeconds(elapsed);

    // Calculate score
    const correctCount = answers.filter(a => a.isCorrect).length + (lastAnswerCorrect ? 1 : 0);
    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= activity.minPassScore;
    const earnedXp = passed ? activity.xpReward : Math.round(activity.xpReward * 0.3);

    // Trigger celebratory confetti if passed!
    if (passed) {
      soundService.playVictory();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#7C3AED', '#F59E0B', '#10B981'],
        });
      } catch {
        // Ignore confetti error
      }
    } else {
      soundService.playIncorrect();
    }

    // Persist attempt in Firestore
    const attempt: AttemptRecord = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.uid || 'guest',
      studentName: currentUser?.name || 'Aluno AMEF',
      activityId: activity.id,
      activityTitle: activity.title,
      moduleId: activity.moduleId,
      scorePercent: scorePct,
      xpEarned: earnedXp,
      passed,
      timeSpentSeconds: elapsed,
      answersSummary: answers,
      createdAt: new Date().toISOString(),
    };

    await dbService.recordAttempt(attempt);
    await updateUserXpAndStreak(earnedXp, passed);
    setIsFinished(true);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentAnswered(false);
    setIsFinished(false);
  };

  // Render question component based on gameType
  const renderGameComponent = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.gameType) {
      case 'multiple_choice':
        return (
          <MultipleChoiceGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'true_false':
        return (
          <TrueFalseGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'matching':
        return (
          <MatchingGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'fill_in_blanks':
        return (
          <FillInTheBlanksGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'step_ordering':
        return (
          <StepOrderingGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'visual_identification':
        return (
          <VisualIdentificationGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'timed_quiz':
        return (
          <TimedQuizGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'error_correction':
        return (
          <ErrorCorrectionGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'shortcut_challenge':
        return (
          <ShortcutChallengeGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'practical_simulator':
        return (
          <PracticalSimulatorGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'open_question':
        return (
          <OpenQuestionGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      case 'memory_game':
        return (
          <MemoryGame
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            answered={currentAnswered}
          />
        );
      default:
        return <div>Tipo de jogo interativo em carregamento...</div>;
    }
  };

  // --- RESULTS SCREEN ---
  if (isFinished) {
    const correctCount = answers.filter(a => a.isCorrect).length;
    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passed = scorePct >= activity.minPassScore;
    const earnedXp = passed ? activity.xpReward : Math.round(activity.xpReward * 0.3);

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-in zoom-in-95">
          {/* Trophy Header */}
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 text-amber-900 animate-bounce">
            {passed ? <Trophy className="w-12 h-12" /> : <Award className="w-12 h-12" />}
          </div>

          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'
            }`}>
              {passed ? 'Excelente Aproveitamento!' : 'Bom Esforço! Continue a Praticar'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {passed ? 'Desafio Superado com Sucesso!' : 'Revise os Conceitos Chave'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {activity.title}
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center">
              <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">+{earnedXp}</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">XP Ganho</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center">
              <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{scorePct}%</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Aproveitamento</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-center">
              <span className="block text-2xl font-black text-purple-600 dark:text-purple-400">{timeSpentSeconds}s</span>
              <span className="text-[11px] font-bold text-slate-500 uppercase">Tempo</span>
            </div>
          </div>

          {/* Summary of Questions */}
          <div className="text-left max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Resumo das Respostas:
            </p>
            {answers.map((ans, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                {ans.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{ans.prompt}</p>
                  <p className="text-slate-500 text-[11px]">{ans.userAnswer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRestart}
              className="flex-1 py-3.5 px-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Repetir Desafio
            </button>
            <button
              onClick={() => {
                if (onFinish) onFinish();
                onClose();
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
            >
              <ArrowRight className="w-4 h-4" />
              Continuar Trilha
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PLAYING SCREEN ---
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col justify-between overflow-hidden">
      
      {/* Top Header / Progress HUD */}
      <header className="max-w-4xl w-full mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts indicator */}
        <div className="flex items-center gap-1.5 text-rose-500 font-black text-sm">
          <Heart className="w-5 h-5 fill-rose-500" />
          <span>{currentUser?.hearts ?? 5}</span>
        </div>
      </header>

      {/* Main Interactive Question Area */}
      <main className="max-w-2xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center overflow-y-auto">
        
        {/* Question Header & Category Badge */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wider">
              {activity.topic || 'Desafio AMEF'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold">
              +{activity.xpReward} XP
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentQuestion.prompt}
          </h1>
        </div>

        {/* Game Engine Dynamic Renderer */}
        <div className="pb-28">
          {renderGameComponent()}
        </div>
      </main>

      {/* Duolingo-style Bottom Sheet Feedback Banner */}
      {currentAnswered && (
        <div
          className={`fixed bottom-0 left-0 right-0 p-5 sm:p-6 border-t-2 z-40 animate-in slide-in-from-bottom duration-200 ${
            lastAnswerCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-500 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/90 border-rose-500 text-rose-900 dark:text-rose-100'
          }`}
        >
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  lastAnswerCorrect
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                }`}
              >
                {lastAnswerCorrect ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <XCircle className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-black text-lg">
                  {lastAnswerCorrect ? 'Fixe! Resposta Correta! 🎉' : 'Quase lá!'}
                </p>
                <p className="text-xs sm:text-sm font-medium opacity-90 max-w-xl">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-sm shadow-md transition-all active:translate-y-0.5 whitespace-nowrap ${
                lastAnswerCorrect
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              }`}
            >
              {currentIndex < questions.length - 1 ? 'Continuar ➔' : 'Ver Resultado 🏆'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
