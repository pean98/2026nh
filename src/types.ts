export type Grade = 1 | 2;

export type SemesterId = "unassigned" | "2-1" | "2-2" | "3-1" | "3-2";

export type SubjectGroup =
  | "국어"
  | "수학"
  | "영어"
  | "사회"
  | "과학"
  | "예술"
  | "정보"
  | "제2외국어/한문"
  | "교양";

export type SelectionType = "일반 선택" | "진로 선택" | "융합 선택";

export type Track =
  | "인문"
  | "사회"
  | "상경"
  | "교육"
  | "자연"
  | "공학"
  | "의약학"
  | "예술·체육"
  | "국제";

export interface LearningArea {
  title: string;
  question: string;
  activities: string[];
}

export interface AdvancedActivity {
  track: Track | string;
  topic: string;
  method: string;
}

export interface Subject {
  id: string;
  grade: Grade;
  name: string;
  group: SubjectGroup;
  selectionType: SelectionType;
  availableSemesters: SemesterId[];
  choiceGroup?: string;
  choiceLimit?: number;
  credits: number;
  creditLabel: string;
  evaluation: string;
  csat: boolean;
  oneLine: string;
  keywords: string[];
  tracks: Track[];
  recommendedFor: string[];
  learningAreas: LearningArea[];
  advancedActivities: AdvancedActivity[];
  prerequisites?: string[];
  videoTitle?: string;
  videoUrl?: string;
}

export interface PlanWarning {
  type: "info" | "warning" | "danger";
  message: string;
}

export type SemesterAssignments = Record<string, SemesterId>;
