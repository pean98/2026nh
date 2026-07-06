import type { PlanWarning, Subject } from "../types";

export const calculateCredits = (selected: Subject[]) => {
  const total = selected.reduce((sum, subject) => sum + subject.credits, 0);
  const kme = selected
    .filter((subject) => ["국어", "수학", "영어"].includes(subject.group))
    .reduce((sum, subject) => sum + subject.credits, 0);
  const byGroup = selected.reduce<Record<string, number>>((acc, subject) => {
    acc[subject.group] = (acc[subject.group] ?? 0) + subject.credits;
    return acc;
  }, {});

  return { total, kme, byGroup };
};

export const createWarnings = (selected: Subject[]): PlanWarning[] => {
  const { total, kme, byGroup } = calculateCredits(selected);
  const warnings: PlanWarning[] = [];

  if (selected.length === 0) {
    warnings.push({ type: "info", message: "관심 과목을 담으면 학점과 이수 기준을 함께 확인할 수 있어요." });
    return warnings;
  }

  if (kme > 81) {
    warnings.push({ type: "danger", message: "국어·수학·영어 교과군 합계가 81학점을 초과했습니다." });
  } else if (kme > 68) {
    warnings.push({ type: "warning", message: "국어·수학·영어 교과군 학점이 높은 편입니다. 전체 균형을 상담해 보세요." });
  }

  if (total > 174) {
    warnings.push({ type: "danger", message: "교과 총 학점 기준 174학점을 초과했습니다." });
  } else if (total > 140) {
    warnings.push({ type: "warning", message: "선택 학점 합계가 커지고 있습니다. 졸업 이수 기준과 시간표를 함께 확인하세요." });
  }

  const science = byGroup["과학"] ?? 0;
  const arts = byGroup["예술"] ?? 0;
  if (science > 0 && science < 10) {
    warnings.push({ type: "info", message: "과학 교과 필수 이수 학점은 10학점 이상입니다. 전체 3개년 계획에서 확인하세요." });
  }
  if (arts > 0 && arts < 10) {
    warnings.push({ type: "info", message: "예술 교과 필수 이수 학점은 10학점 이상입니다. 전체 3개년 계획에서 확인하세요." });
  }

  selected.forEach((subject) => {
    subject.prerequisites?.forEach((name) => {
      const hasPrerequisite = selected.some((item) => item.name.includes(name));
      if (!hasPrerequisite) {
        warnings.push({
          type: "warning",
          message: `${subject.name} 선택 전 ${name} 이수 여부를 담임 선생님과 확인하세요.`,
        });
      }
    });
  });

  if (warnings.length === 0) {
    warnings.push({ type: "info", message: "현재 선택 조합에서 큰 경고는 없습니다. 진로와 시간표 가능 여부를 상담해 보세요." });
  }

  return warnings;
};

export const persistSelectedIds = (ids: string[]) => {
  window.localStorage.setItem("selectedSubjectIds", JSON.stringify(ids));
};

export const loadSelectedIds = () => {
  try {
    const raw = window.localStorage.getItem("selectedSubjectIds");
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};
