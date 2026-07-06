import type { Track } from "../types";

export interface AdmissionRecommendation {
  id: string;
  university: string;
  department: string;
  track: Track;
  coreSubjects: string[];
  recommendedSubjects: string[];
  note: string;
}

export const admissionRecommendations: AdmissionRecommendation[] = [
  {
    id: "snu-psychology",
    university: "서울대학교",
    department: "심리학과",
    track: "사회",
    coreSubjects: ["사회와 문화", "인간과 심리"],
    recommendedSubjects: ["윤리와 사상", "논술", "데이터 과학"],
    note: "사회 현상 이해, 자료 해석, 인간 행동 탐구 역량을 함께 보여주는 조합입니다.",
  },
  {
    id: "inha-computer",
    university: "인하대학교",
    department: "컴퓨터공학과",
    track: "공학",
    coreSubjects: ["미적분Ⅱ", "인공지능 기초", "소프트웨어와 생활"],
    recommendedSubjects: ["데이터 과학", "기하", "물리학"],
    note: "수학적 사고, 컴퓨팅 사고, 데이터 활용 경험을 함께 확인할 수 있습니다.",
  },
  {
    id: "yonsei-business",
    university: "연세대학교",
    department: "경영학과",
    track: "상경",
    coreSubjects: ["경제", "경제 수학"],
    recommendedSubjects: ["실용 통계", "데이터 과학", "논술"],
    note: "경제 원리, 통계적 해석, 논리적 의사소통 역량을 연결해 볼 수 있습니다.",
  },
  {
    id: "inha-bio",
    university: "인하대학교",
    department: "생명공학과",
    track: "자연",
    coreSubjects: ["생명과학", "생물의 유전", "화학"],
    recommendedSubjects: ["세포와 물질대사", "화학 반응의 세계", "데이터 과학"],
    note: "생명 현상 이해와 화학 기초, 데이터 기반 탐구 경험을 함께 설계합니다.",
  },
  {
    id: "edu-korean",
    university: "인천대학교",
    department: "국어교육과",
    track: "교육",
    coreSubjects: ["독서 토론과 글쓰기", "언어생활 탐구"],
    recommendedSubjects: ["문학과 영상", "논술", "인간과 심리"],
    note: "읽기·쓰기·언어 탐구와 학생 이해 역량을 함께 보여줄 수 있습니다.",
  },
  {
    id: "hongik-design",
    university: "홍익대학교",
    department: "디자인학부",
    track: "예술·체육",
    coreSubjects: ["미술 창작", "미술과 매체"],
    recommendedSubjects: ["문학과 영상", "음악과 미디어", "소프트웨어와 생활"],
    note: "시각 표현, 매체 이해, 디지털 제작 경험을 연결해 볼 수 있습니다.",
  },
];

export const dreamDureTypes = [
  {
    title: "거점형",
    description: "특정 학교가 거점이 되어 여러 학교 학생이 함께 수업을 듣는 방식입니다.",
    checklist: ["이동 거리와 시간 확인", "개설 학교와 수업 요일 확인", "본교 시간표와 충돌 여부 상담"],
  },
  {
    title: "밴드형",
    description: "인근 학교들이 협력해 공동으로 과목을 개설하고 운영하는 방식입니다.",
    checklist: ["참여 학교 범위 확인", "신청 인원과 선발 조건 확인", "평가 방식과 출결 처리 확인"],
  },
  {
    title: "온라인형",
    description: "온라인 수업 환경에서 학교 미개설 과목을 수강할 수 있는 방식입니다.",
    checklist: ["온라인 학습 환경 준비", "과제와 평가 일정 확인", "자기주도 학습 가능성 점검"],
  },
];
