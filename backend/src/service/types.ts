
export interface SetData {
  reps: number;
  weight: number;
  rir: number;
}

export interface SorenessData {
  soreness_score?: number;
  score?: number;
  description?: string;
}

export interface PerformanceData {
  performance_score?: number;
  score?: number;
  description?: string;
}

export interface ExerciseData {
  exercise_name: string;
  muscletrained: string;
  set: SetData[];
  soreness?: SorenessData | null;
  performance?: PerformanceData | null;
}

export interface SessionPayload {
  sessionData: ExerciseData[];
}


export type PrismaTransaction = any;
