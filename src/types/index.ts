export type UserRole = 'admin' | 'student';
export type AccountStatus = 'active' | 'suspended';

export type GameType =
  | 'multiple_choice'
  | 'true_false'
  | 'matching'
  | 'fill_in_blanks'
  | 'step_ordering'
  | 'visual_identification'
  | 'timed_quiz'
  | 'error_correction'
  | 'shortcut_challenge'
  | 'practical_simulator'
  | 'open_question'
  | 'memory_game'
  | 'final_boss';

export type ActivityDifficulty = 'Fácil' | 'Médio' | 'Difícil';
export type ActivityStatus = 'draft' | 'published' | 'archived';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  avatar: string;
  xp: number;
  level: string;
  streakDays: number;
  lastActiveDate: string;
  badges: string[]; // Badge IDs
  hearts: number; // Duolingo style (max 5)
  createdAt: string;
}

export interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  color: string;
  totalActivities: number;
  isPublished: boolean;
}

// Question schema definitions per game type
export interface BaseQuestion {
  id: string;
  gameType: GameType;
  prompt: string;
  explanation: string; // Explicação detalhada após responder
  tip?: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  gameType: 'multiple_choice';
  options: string[];
  correctAnswerIndex: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  gameType: 'true_false';
  statement: string;
  isTrue: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  gameType: 'matching';
  pairs: MatchingPair[];
}

export interface FillInBlanksQuestion extends BaseQuestion {
  gameType: 'fill_in_blanks';
  sentenceWithGaps: string; // Ex: "Para colar um texto previamente copiado, pressionamos [Ctrl+V] no teclado."
  blanks: { key: string; word: string }[];
  optionsPool: string[]; // Banco de palavras para arrastar/clicar
}

export interface StepItem {
  id: string;
  order: number;
  text: string;
}

export interface StepOrderingQuestion extends BaseQuestion {
  gameType: 'step_ordering';
  steps: StepItem[]; // Correct order
}

export interface VisualHotspot {
  id: string;
  label: string;
  description: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
}

export interface VisualIdentificationQuestion extends BaseQuestion {
  gameType: 'visual_identification';
  visualType: 'windows_desktop' | 'word_ribbon' | 'excel_grid' | 'powerpoint_ui' | 'hardware_ports';
  targetHotspotId: string;
  hotspots: VisualHotspot[];
}

export interface TimedQuizQuestion extends BaseQuestion {
  gameType: 'timed_quiz';
  options: string[];
  correctAnswerIndex: number;
  durationSeconds: number; // Ex: 15s
}

export interface ErrorCorrectionOption {
  id: string;
  text: string;
  isSafeOrCorrect: boolean;
}

export interface ErrorCorrectionQuestion extends BaseQuestion {
  gameType: 'error_correction';
  scenarioText: string;
  mistakeDescription: string;
  options: ErrorCorrectionOption[];
  correctOptionId: string;
}

export interface ShortcutQuestion extends BaseQuestion {
  gameType: 'shortcut_challenge';
  actionName: string; // Ex: "Copiar ficheiro ou texto selecionado"
  requiredKeys: string[]; // Ex: ["Ctrl", "C"]
  description: string;
}

export interface SimulatorTask {
  id: string;
  instruction: string;
  targetAction: string; // Ex: 'click_folder', 'type_bold', 'enter_sum'
  completed: boolean;
}

export interface PracticalSimulatorQuestion extends BaseQuestion {
  gameType: 'practical_simulator';
  appEnvironment: 'windows_explorer' | 'word_editor' | 'excel_sheet' | 'powerpoint_slides';
  initialState?: Record<string, unknown>;
  tasks: SimulatorTask[];
}

export interface OpenQuestionCriterion {
  keyword: string;
  description: string;
  points: number;
}

export interface OpenQuestion extends BaseQuestion {
  gameType: 'open_question';
  sampleIdealAnswer: string;
  requiredKeywords: string[];
  minWords: number;
}

export interface MemoryCardPair {
  id: string;
  concept: string;
  definitionOrIcon: string;
}

export interface MemoryGameQuestion extends BaseQuestion {
  gameType: 'memory_game';
  pairs: MemoryCardPair[]; // Usually 4 to 6 pairs
}

export interface FinalBossQuestion extends BaseQuestion {
  gameType: 'final_boss';
  subQuestions: AnyQuestion[];
}

export type AnyQuestion =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | MatchingQuestion
  | FillInBlanksQuestion
  | StepOrderingQuestion
  | VisualIdentificationQuestion
  | TimedQuizQuestion
  | ErrorCorrectionQuestion
  | ShortcutQuestion
  | PracticalSimulatorQuestion
  | OpenQuestion
  | MemoryGameQuestion
  | FinalBossQuestion;

export interface ActivityItem {
  id: string;
  moduleId: string;
  title: string;
  topic: string;
  description: string;
  instructions: string;
  difficulty: ActivityDifficulty;
  gameType: GameType;
  xpReward: number;
  minPassScore: number; // Ex: 70
  timeLimitSeconds?: number;
  maxAttempts: number; // 0 = unlimited
  questions: AnyQuestion[];
  status: ActivityStatus;
  order: number;
  updatedAt: string;
}

export interface AttemptAnswer {
  questionId: string;
  prompt: string;
  isCorrect: boolean;
  userAnswer?: string | string[] | number | boolean;
  correctAnswer?: string | string[] | number | boolean;
}

export interface AttemptRecord {
  id: string;
  userId: string;
  studentName: string;
  activityId: string;
  activityTitle: string;
  moduleId: string;
  scorePercent: number;
  xpEarned: number;
  passed: boolean;
  timeSpentSeconds: number;
  answersSummary: AttemptAnswer[];
  createdAt: string;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'xp' | 'streak' | 'modules' | 'speed' | 'mastery';
  xpBonus: number;
  requirementType: 'min_xp' | 'min_streak' | 'completed_modules' | 'perfect_score' | 'shortcuts_master';
  requirementValue: number;
}
