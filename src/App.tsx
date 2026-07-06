import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  GraduationCap,
  LibraryBig,
  Menu,
  Search,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import { keywords, selectionTypes, subjectGroups, subjects, tracks } from "./data/subjects";
import { admissionRecommendations, dreamDureSubjects, dreamDureTypes } from "./data/admissions";
import type { Grade, SelectionType, SemesterAssignments, SemesterId, Subject, SubjectGroup, Track } from "./types";
import {
  calculateCredits,
  createSemesterWarnings,
  createWarnings,
  loadSelectedIds,
  loadSemesterAssignments,
  persistSelectedIds,
  persistSemesterAssignments,
  semesters,
} from "./utils/planner";

type View = "dashboard" | "guide" | "subjects" | "matching" | "planner" | "dreamdure" | "resources";

const navItems: Array<{ id: View; label: string }> = [
  { id: "dashboard", label: "홈" },
  { id: "guide", label: "고교학점제" },
  { id: "subjects", label: "과목 백과" },
  { id: "matching", label: "진로 매칭" },
  { id: "planner", label: "나의 설계" },
  { id: "dreamdure", label: "공동교육" },
  { id: "resources", label: "자료실" },
];

const gradeLabels: Record<Grade | "all", string> = {
  all: "전체",
  1: "1학년",
  2: "2학년",
};

const statCards = [
  { label: "총 이수 학점", value: "192", note: "교과 174 + 창체 18" },
  { label: "필수 이수 학점", value: "84+", note: "교과군별 기준 확인" },
  { label: "국·수·영 제한", value: "81", note: "초과 불가" },
  { label: "선택 과목", value: "62", note: "1학년 27개, 2학년 35개" },
];

const guideSteps = [
  { title: "이수 기준 확인", text: "졸업, 필수 이수 학점, 국수영 제한을 먼저 확인합니다." },
  { title: "진로·학과 탐색", text: "관심 계열과 학과에서 요구하는 역량을 살펴봅니다." },
  { title: "과목 선택 및 상담", text: "후보 과목을 담고 담임·교과·진로 선생님과 상담합니다." },
  { title: "학업 계획 관리", text: "선택 이유와 학습 계획을 남기고 필요하면 보완합니다." },
];

function App() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<SubjectGroup | "all">("all");
  const [selectionType, setSelectionType] = useState<SelectionType | "all">("all");
  const [semesterFilter, setSemesterFilter] = useState<SemesterId | "all">("all");
  const [track, setTrack] = useState<Track | "all">("all");
  const [activeKeyword, setActiveKeyword] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [semesterAssignments, setSemesterAssignments] = useState<SemesterAssignments>({});
  const [memo, setMemo] = useState("");

  useEffect(() => {
    setSelectedIds(loadSelectedIds());
    setSemesterAssignments(loadSemesterAssignments());
    setMemo(window.localStorage.getItem("plannerMemo") ?? "");
  }, []);

  useEffect(() => {
    persistSelectedIds(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    persistSemesterAssignments(semesterAssignments);
  }, [semesterAssignments]);

  useEffect(() => {
    window.localStorage.setItem("plannerMemo", memo);
  }, [memo]);

  const selectedSubjects = useMemo(
    () => subjects.filter((subject) => selectedIds.includes(subject.id)),
    [selectedIds],
  );

  const planner = useMemo(() => calculateCredits(selectedSubjects), [selectedSubjects]);
  const warnings = useMemo(
    () => [...createWarnings(selectedSubjects), ...createSemesterWarnings(selectedSubjects, semesterAssignments)],
    [selectedSubjects, semesterAssignments],
  );

  const filteredSubjects = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return subjects.filter((subject) => {
      const text = [
        subject.name,
        subject.oneLine,
        subject.group,
        subject.selectionType,
        subject.availableSemesters.join(" "),
        ...subject.keywords,
        ...subject.tracks,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalized || text.includes(normalized)) &&
        (group === "all" || subject.group === group) &&
        (selectionType === "all" || subject.selectionType === selectionType) &&
        (semesterFilter === "all" || subject.availableSemesters.includes(semesterFilter)) &&
        (track === "all" || subject.tracks.includes(track)) &&
        (activeKeyword === "all" || subject.keywords.includes(activeKeyword))
      );
    });
  }, [activeKeyword, group, query, selectionType, semesterFilter, track]);

  const toggleSubject = (subject: Subject) => {
    setSelectedIds((current) => {
      if (current.includes(subject.id)) {
        setSemesterAssignments((assignments) => {
          const next = { ...assignments };
          delete next[subject.id];
          return next;
        });
        return current.filter((id) => id !== subject.id);
      }
      setSemesterAssignments((assignments) => ({ ...assignments, [subject.id]: "unassigned" }));
      return [...current, subject.id];
    });
  };

  const assignSemester = (subjectId: string, semester: SemesterId) => {
    setSemesterAssignments((current) => ({ ...current, [subjectId]: semester }));
  };

  const openSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setView("subjects");
  };

  const resetFilters = () => {
    setQuery("");
    setGroup("all");
    setSelectionType("all");
    setSemesterFilter("all");
    setTrack("all");
    setActiveKeyword("all");
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={20} />
        </button>
        <button className="brand" type="button" onClick={() => setView("dashboard")}>
          <span className="brand-mark">IN</span>
          <span>
            <strong>인천논현고</strong>
            <small>2026 교육과정박람회</small>
          </span>
        </button>
        <nav className="desktop-nav">
          {navItems.map((item) => (
            <button
              className={view === item.id ? "active" : ""}
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-panel">
            <div className="mobile-menu-head">
              <strong>메뉴</strong>
              <button type="button" onClick={() => setMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {navItems.map((item) => (
              <button
                className={view === item.id ? "active" : ""}
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main>
        {view === "dashboard" && (
          <Dashboard
            selectedCount={selectedSubjects.length}
            setView={setView}
            setSemesterFilter={setSemesterFilter}
            setActiveKeyword={setActiveKeyword}
          />
        )}
        {view === "guide" && <Guide />}
        {view === "subjects" && (
          <SubjectsView
            activeKeyword={activeKeyword}
            filteredSubjects={filteredSubjects}
            group={group}
            openSubject={openSubject}
            query={query}
            resetFilters={resetFilters}
            selectedIds={selectedIds}
            selectedSubject={selectedSubject}
            selectionType={selectionType}
            setActiveKeyword={setActiveKeyword}
            setGroup={setGroup}
            setQuery={setQuery}
            setSelectionType={setSelectionType}
            semesterFilter={semesterFilter}
            setSemesterFilter={setSemesterFilter}
            setTrack={setTrack}
            toggleSubject={toggleSubject}
            track={track}
          />
        )}
        {view === "matching" && (
          <MatchingView
            openSubject={openSubject}
            selectedSubjects={selectedSubjects}
            setTrack={setTrack}
            setView={setView}
          />
        )}
        {view === "planner" && (
          <PlannerView
            memo={memo}
            planner={planner}
            semesterAssignments={semesterAssignments}
            assignSemester={assignSemester}
            selectedSubjects={selectedSubjects}
            setMemo={setMemo}
            setView={setView}
            toggleSubject={toggleSubject}
            warnings={warnings}
          />
        )}
        {view === "dreamdure" && <DreamDureView setView={setView} />}
        {view === "resources" && <ResourcesView />}
      </main>
    </div>
  );
}

function Dashboard({
  selectedCount,
  setActiveKeyword,
  setSemesterFilter,
  setView,
}: {
  selectedCount: number;
  setActiveKeyword: (keyword: string) => void;
  setSemesterFilter: (semester: SemesterId | "all") => void;
  setView: (view: View) => void;
}) {
  const quickKeywords = ["데이터분석", "비판적사고", "세계시민", "AI", "환경감수성", "스토리텔링"];

  return (
    <section className="dashboard">
      <div className="dashboard-intro">
        <div className="intro-copy">
          <span className="eyebrow">2026 Curriculum Fair</span>
          <h1>내 꿈을 향한 주도적인 선택</h1>
          <p>
            1·2학년 과목 선택 워크북을 검색 가능한 웹사이트로 바꾸고, 관심 과목을 담아 학점 기준까지
            점검해 볼 수 있습니다.
          </p>
          <div className="hero-actions">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                setSemesterFilter("2-1");
                setView("subjects");
              }}
            >
              2학년 개설 과목 보기
              <ChevronRight size={18} />
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setSemesterFilter("3-1");
                setView("subjects");
              }}
            >
              3학년 개설 과목 보기
            </button>
          </div>
        </div>
        <div className="visual-panel" aria-label="교육과정 설계 요약">
          <div className="orbit-card main-orbit">
            <GraduationCap size={30} />
            <strong>학업 계획</strong>
            <span>{selectedCount}개 과목 담김</span>
          </div>
          <div className="mini-node node-a">검색</div>
          <div className="mini-node node-b">상담</div>
          <div className="mini-node node-c">설계</div>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.note}</small>
          </div>
        ))}
      </div>

      <div className="quick-grid">
        <button type="button" onClick={() => setView("subjects")}>
          <LibraryBig size={24} />
          <strong>선택 과목 백과</strong>
          <span>60개 과목을 필터와 태그로 탐색</span>
        </button>
        <button type="button" onClick={() => setView("planner")}>
          <Calculator size={24} />
          <strong>나만의 교육과정 설계</strong>
          <span>관심 과목을 담고 학점 기준 확인</span>
        </button>
        <button type="button" onClick={() => setView("matching")}>
          <Sparkles size={24} />
          <strong>진로·대입 매칭</strong>
          <span>계열별 권장 과목 흐름 확인</span>
        </button>
        <button type="button" onClick={() => setView("dreamdure")}>
          <GraduationCap size={24} />
          <strong>꿈두레 공동교육과정</strong>
          <span>학교 미개설 과목 수강 방법 확인</span>
        </button>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">Tag Search</span>
          <h2>관심 키워드로 시작하기</h2>
        </div>
        <div className="tag-cloud">
          {quickKeywords.map((keyword) => (
            <button
              key={keyword}
              type="button"
              onClick={() => {
                setActiveKeyword(keyword);
                setView("subjects");
              }}
            >
              #{keyword}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

function Guide() {
  return (
    <section className="content-page">
      <div className="page-title">
        <span className="eyebrow">Guide</span>
        <h1>고교학점제 한눈에 보기</h1>
        <p>과목 선택 전 반드시 확인해야 할 기준만 짧게 정리했습니다.</p>
      </div>
      <div className="guide-grid">
        {guideSteps.map((step, index) => (
          <div className="guide-card" key={step.title}>
            <span>{index + 1}</span>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
      <div className="info-band">
        <BookOpen size={28} />
        <div>
          <strong>2022 개정 교육과정 과목 구조</strong>
          <p>
            공통 과목은 기초소양과 기본학력을 보장하고, 선택 과목은 일반 선택·진로 선택·융합 선택으로
            구분됩니다. 과목 선택은 진로 탐색과 대입 준비를 함께 보여주는 중요한 자료가 됩니다.
          </p>
        </div>
      </div>
      <div className="credit-layout">
        <div>
          <h2>졸업 이수 기준</h2>
          <ul className="check-list">
            <li>3년간 총 192학점 이수</li>
            <li>교과 174학점 + 창의적 체험활동 18학점</li>
            <li>필수 이수 학점 84학점 이상</li>
            <li>국어·수학·영어 교과군 총합 81학점 초과 불가</li>
          </ul>
        </div>
        <div>
          <h2>성적 산출 방식</h2>
          <ul className="check-list">
            <li>대부분 과목은 원점수, 성취도, 석차등급, 통계정보 기재</li>
            <li>체육·예술 일부 과목은 성취도 3단계</li>
            <li>교양 과목은 P 이수 여부 중심</li>
            <li>사회·과학 융합 선택은 평가 정보가 과목별로 다를 수 있음</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function SubjectsView(props: {
  activeKeyword: string;
  filteredSubjects: Subject[];
  group: SubjectGroup | "all";
  openSubject: (subject: Subject) => void;
  query: string;
  resetFilters: () => void;
  selectedIds: string[];
  selectedSubject: Subject;
  selectionType: SelectionType | "all";
  semesterFilter: SemesterId | "all";
  setActiveKeyword: (keyword: string) => void;
  setGroup: (group: SubjectGroup | "all") => void;
  setQuery: (query: string) => void;
  setSelectionType: (selectionType: SelectionType | "all") => void;
  setSemesterFilter: (semester: SemesterId | "all") => void;
  setTrack: (track: Track | "all") => void;
  toggleSubject: (subject: Subject) => void;
  track: Track | "all";
}) {
  return (
    <section className="subjects-layout">
      <aside className="filter-panel">
        <div className="filter-title">
          <Filter size={20} />
          <strong>과목 찾기</strong>
        </div>
        <label className="search-box">
          <Search size={18} />
          <input
            placeholder="과목명, 키워드, 계열 검색"
            value={props.query}
            onChange={(event) => props.setQuery(event.target.value)}
          />
        </label>
        <FilterSelect label="교과군" value={props.group} onChange={(value) => props.setGroup(value as SubjectGroup | "all")}>
          <option value="all">전체</option>
          {subjectGroups.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="선택 유형"
          value={props.selectionType}
          onChange={(value) => props.setSelectionType(value as SelectionType | "all")}
        >
          <option value="all">전체</option>
          {selectionTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect
          label="개설 학기"
          value={props.semesterFilter}
          onChange={(value) => props.setSemesterFilter(value as SemesterId | "all")}
        >
          <option value="all">전체</option>
          {semesters
            .filter((semester) => semester.id !== "unassigned")
            .map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.label}
              </option>
            ))}
        </FilterSelect>
        <FilterSelect label="관심 계열" value={props.track} onChange={(value) => props.setTrack(value as Track | "all")}>
          <option value="all">전체</option>
          {tracks.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </FilterSelect>
        <button className="ghost-button" type="button" onClick={props.resetFilters}>
          필터 초기화
        </button>
      </aside>

      <section className="subject-results">
        <div className="section-heading compact">
          <span className="eyebrow">Subject Encyclopedia</span>
          <h1>선택 과목 백과</h1>
          <p>{props.filteredSubjects.length}개 과목이 검색되었습니다.</p>
        </div>
        <div className="tag-strip">
          <button
            className={props.activeKeyword === "all" ? "active" : ""}
            type="button"
            onClick={() => props.setActiveKeyword("all")}
          >
            전체
          </button>
          {keywords.slice(0, 26).map((keyword) => (
            <button
              className={props.activeKeyword === keyword ? "active" : ""}
              key={keyword}
              type="button"
              onClick={() => props.setActiveKeyword(keyword)}
            >
              #{keyword}
            </button>
          ))}
        </div>
        <div className="subject-grid">
          {props.filteredSubjects.map((subjectItem) => (
            <SubjectCard
              isSelected={props.selectedIds.includes(subjectItem.id)}
              key={subjectItem.id}
              onOpen={() => props.openSubject(subjectItem)}
              onToggle={() => props.toggleSubject(subjectItem)}
              subject={subjectItem}
            />
          ))}
        </div>
      </section>

      <SubjectDetail
        isSelected={props.selectedIds.includes(props.selectedSubject.id)}
        subject={props.selectedSubject}
        toggleSubject={() => props.toggleSubject(props.selectedSubject)}
      />
    </section>
  );
}

function FilterSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string | number;
}) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

function SubjectCard({
  isSelected,
  onOpen,
  onToggle,
  subject,
}: {
  isSelected: boolean;
  onOpen: () => void;
  onToggle: () => void;
  subject: Subject;
}) {
  return (
    <article className="subject-card">
      <button className="card-main" type="button" onClick={onOpen}>
        <div className="card-meta">
          <span>{gradeLabels[subject.grade]}</span>
        <span>{subject.group}</span>
        <span>{subject.selectionType}</span>
          {subject.choiceGroup && <span>{subject.choiceGroup} 택{subject.choiceLimit}</span>}
          <span>{subject.availableSemesters.map((semester) => semesters.find((item) => item.id === semester)?.shortLabel).join(", ")}</span>
        </div>
        <h3>{subject.name}</h3>
        <p>{subject.oneLine}</p>
        <div className="keyword-row">
          {subject.keywords.slice(0, 3).map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      </button>
      <div className="card-foot">
        <span>{subject.creditLabel}</span>
        <button className={isSelected ? "selected-button" : "add-button"} type="button" onClick={onToggle}>
          {isSelected ? "담김" : "담기"}
        </button>
      </div>
    </article>
  );
}

function SubjectDetail({
  isSelected,
  subject,
  toggleSubject,
}: {
  isSelected: boolean;
  subject: Subject;
  toggleSubject: () => void;
}) {
  return (
    <aside className="detail-panel">
      <div className="detail-head">
        <span className="eyebrow">{subject.group}</span>
        <h2>{subject.name}</h2>
        <p>{subject.oneLine}</p>
        <button className={isSelected ? "selected-button wide" : "primary-button wide"} type="button" onClick={toggleSubject}>
          {isSelected ? "설계함에서 빼기" : "나의 설계함에 담기"}
        </button>
      </div>
      <div className="profile-grid">
        <span>학년<strong>{gradeLabels[subject.grade]}</strong></span>
        <span>유형<strong>{subject.selectionType}</strong></span>
        <span>학점<strong>{subject.creditLabel}</strong></span>
        <span>수능<strong>{subject.csat ? "출제" : "미출제"}</strong></span>
        <span>평가<strong>{subject.evaluation}</strong></span>
        <span>계열<strong>{subject.tracks.join(" · ")}</strong></span>
        <span>개설 학기<strong>{subject.availableSemesters.map((semester) => semesters.find((item) => item.id === semester)?.shortLabel).join(" · ")}</strong></span>
        <span>선택 조건<strong>{subject.choiceGroup ? `${subject.choiceGroup} 택${subject.choiceLimit}` : "개별 선택"}</strong></span>
      </div>
      <div className="detail-section">
        <h3>주요 키워드</h3>
        <div className="keyword-row wrap">
          {subject.keywords.map((keyword) => (
            <span key={keyword}>#{keyword}</span>
          ))}
        </div>
      </div>
      <div className="detail-section">
        <h3>무엇을 배울 수 있나요?</h3>
        {subject.learningAreas.map((area) => (
          <div className="learning-area" key={area.title}>
            <strong>{area.title}</strong>
            <p>{area.question}</p>
            <ul>
              {area.activities.map((activity) => (
                <li key={activity}>{activity}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="detail-section">
        <h3>선배가 들려주는 심화 학습 활동</h3>
        {subject.advancedActivities.map((activity) => (
          <div className="advanced-activity" key={`${activity.track}-${activity.topic}`}>
            <span>{activity.track}</span>
            <strong>{activity.topic}</strong>
            <p>{activity.method}</p>
          </div>
        ))}
      </div>
      <div className="detail-section">
        <h3>이런 학생에게 추천해요</h3>
        <ul className="check-list">
          {subject.recommendedFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="detail-section consult-box">
        <h3>상담 때 확인할 질문</h3>
        <ul>
          <li>이 과목이 나의 희망 진로 또는 학과와 어떻게 연결될까요?</li>
          <li>선수 과목이나 함께 들으면 좋은 과목이 있을까요?</li>
          <li>수행평가와 탐구 활동은 어떤 방식으로 준비하면 좋을까요?</li>
        </ul>
      </div>
    </aside>
  );
}

function MatchingView({
  openSubject,
  selectedSubjects,
  setTrack,
  setView,
}: {
  openSubject: (subject: Subject) => void;
  selectedSubjects: Subject[];
  setTrack: (track: Track | "all") => void;
  setView: (view: View) => void;
}) {
  const selectedNames = selectedSubjects.map((subject) => subject.name);
  const scoredRecommendations = admissionRecommendations.map((item) => {
    const required = [...item.coreSubjects, ...item.recommendedSubjects];
    const matched = required.filter((name) => selectedNames.some((selected) => selected.includes(name) || name.includes(selected)));
    return { ...item, matched };
  });

  return (
    <section className="content-page">
      <div className="page-title">
        <span className="eyebrow">Career & Admissions</span>
        <h1>진로 및 대입 매칭</h1>
        <p>계열을 선택하면 관련 과목 흐름을 확인할 수 있습니다. 대학별 권장과목은 상담 참고 자료입니다.</p>
      </div>
      <div className="track-grid">
        {tracks.map((item) => {
          const related = subjects.filter((subject) => subject.tracks.includes(item)).slice(0, 4);
          return (
            <article className="track-card" key={item}>
              <div>
                <Tags size={22} />
                <h2>{item} 계열</h2>
              </div>
              <p>{related.map((subject) => subject.name).join(", ")}</p>
              <button
                type="button"
                onClick={() => {
                  setTrack(item);
                  setView("subjects");
                }}
              >
                관련 과목 보기
              </button>
            </article>
          );
        })}
      </div>
      <div className="match-panel">
        <h2>내가 담은 과목과 계열 연결</h2>
        {selectedSubjects.length === 0 ? (
          <p>과목을 담으면 여기에서 관심 계열과의 연결성을 확인할 수 있습니다.</p>
        ) : (
          <div className="selected-list">
            {selectedSubjects.map((subject) => (
              <button key={subject.id} type="button" onClick={() => openSubject(subject)}>
                <strong>{subject.name}</strong>
                <span>{subject.tracks.join(" · ")}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="match-panel">
        <h2>대학·학과별 권장과목 예시 매칭</h2>
        <p className="muted-text">
          아래 자료는 사이트 기능을 보여주기 위한 상담 참고 예시입니다. 실제 지원 전에는 반드시 해당 대학 입학처의 최신
          안내를 확인해야 합니다.
        </p>
        <div className="recommendation-grid">
          {scoredRecommendations.map((item) => (
            <article className="recommendation-card" key={item.id}>
              <div className="recommendation-head">
                <span>{item.track}</span>
                <strong>{item.university} {item.department}</strong>
              </div>
              <SubjectPills title="핵심 권장" names={item.coreSubjects} selectedNames={selectedNames} />
              <SubjectPills title="권장" names={item.recommendedSubjects} selectedNames={selectedNames} />
              <p>{item.note}</p>
              <div className="match-score">
                <span>현재 담은 과목과 일치</span>
                <strong>{item.matched.length}</strong>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SubjectPills({ names, selectedNames, title }: { names: string[]; selectedNames: string[]; title: string }) {
  return (
    <div className="subject-pills">
      <span>{title}</span>
      <div>
        {names.map((name) => {
          const matched = selectedNames.some((selected) => selected.includes(name) || name.includes(selected));
          return <mark className={matched ? "matched" : ""} key={name}>{name}</mark>;
        })}
      </div>
    </div>
  );
}

function PlannerView({
  assignSemester,
  memo,
  planner,
  semesterAssignments,
  selectedSubjects,
  setMemo,
  setView,
  toggleSubject,
  warnings,
}: {
  assignSemester: (subjectId: string, semester: SemesterId) => void;
  memo: string;
  planner: ReturnType<typeof calculateCredits>;
  semesterAssignments: SemesterAssignments;
  selectedSubjects: Subject[];
  setMemo: (memo: string) => void;
  setView: (view: View) => void;
  toggleSubject: (subject: Subject) => void;
  warnings: ReturnType<typeof createWarnings>;
}) {
  const semesterSummaries = semesters.map((semester) => {
    const items = selectedSubjects.filter((subject) => (semesterAssignments[subject.id] ?? "unassigned") === semester.id);
    const credits = items.reduce((sum, subject) => sum + subject.credits, 0);
    return { ...semester, items, credits };
  });

  return (
    <section className="content-page planner-page">
      <div className="page-title">
        <span className="eyebrow">Planner</span>
        <h1>나만의 교육과정 설계</h1>
        <p>관심 과목을 담아 학점 기준을 점검하고 상담 질문을 정리합니다.</p>
      </div>
      <div className="planner-layout">
        <div className="planner-main">
          <div className="planner-stats">
            <div><span>담은 과목</span><strong>{selectedSubjects.length}</strong></div>
            <div><span>선택 학점</span><strong>{planner.total}</strong></div>
            <div><span>국·수·영</span><strong>{planner.kme}</strong></div>
          </div>
          <div className="warning-list">
            {warnings.map((warning) => (
              <div className={`warning ${warning.type}`} key={warning.message}>
                <CheckCircle2 size={18} />
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
          <div className="planner-subjects">
            {selectedSubjects.length === 0 ? (
              <div className="empty-state">
                <LibraryBig size={34} />
                <strong>아직 담은 과목이 없습니다.</strong>
                <button className="primary-button" type="button" onClick={() => setView("subjects")}>
                  과목 담으러 가기
                </button>
              </div>
            ) : (
              <SemesterBoard
                assignSemester={assignSemester}
                semesterAssignments={semesterAssignments}
                semesterSummaries={semesterSummaries}
                toggleSubject={toggleSubject}
              />
            )}
          </div>
          <ComparisonTable selectedSubjects={selectedSubjects} />
        </div>
        <aside className="memo-panel">
          <h2>상담 질문</h2>
          <textarea
            placeholder="희망 진로, 고민 중인 과목, 선생님께 묻고 싶은 내용을 적어보세요."
            value={memo}
            onChange={(event) => setMemo(event.target.value)}
          />
          <button className="secondary-button wide" type="button" onClick={() => window.print()}>
            <Download size={18} />
            상담용으로 출력
          </button>
        </aside>
      </div>
    </section>
  );
}

function SemesterBoard({
  assignSemester,
  semesterAssignments,
  semesterSummaries,
  toggleSubject,
}: {
  assignSemester: (subjectId: string, semester: SemesterId) => void;
  semesterAssignments: SemesterAssignments;
  semesterSummaries: Array<{ id: SemesterId; label: string; shortLabel: string; items: Subject[]; credits: number }>;
  toggleSubject: (subject: Subject) => void;
}) {
  return (
    <div className="semester-board">
      {semesterSummaries.map((semester) => (
        <section className={semester.id === "unassigned" ? "semester-column unassigned" : "semester-column"} key={semester.id}>
          <div className="semester-head">
            <strong>{semester.label}</strong>
            <span>{semester.credits}학점 · {semester.items.length}개</span>
          </div>
          <div className="semester-items">
            {semester.items.length === 0 ? (
              <p className="semester-empty">배치된 과목이 없습니다.</p>
            ) : (
              semester.items.map((subject) => (
                <article className="planner-item" key={subject.id}>
                  <div>
                    <strong>{subject.name}</strong>
                    <span>{subject.group} · {subject.selectionType} · {subject.creditLabel}</span>
                  </div>
                  <label>
                    <span>학기</span>
                    <select
                      value={semesterAssignments[subject.id] ?? "unassigned"}
                      onChange={(event) => assignSemester(subject.id, event.target.value as SemesterId)}
                    >
                      {semesters
                        .filter(
                          (option) =>
                            option.id === "unassigned" ||
                            subject.availableSemesters.includes(option.id) ||
                            option.id === semesterAssignments[subject.id],
                        )
                        .map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="button" onClick={() => toggleSubject(subject)}>
                    빼기
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function ComparisonTable({ selectedSubjects }: { selectedSubjects: Subject[] }) {
  const comparison = selectedSubjects.slice(0, 4);

  if (comparison.length < 2) {
    return (
      <div className="comparison-empty">
        <strong>과목 비교</strong>
        <p>과목을 2개 이상 담으면 교과군, 학점, 평가 방식, 키워드를 나란히 비교할 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="comparison-panel">
      <div className="comparison-head">
        <h2>과목 비교</h2>
        <span>최대 4개 표시</span>
      </div>
      <div className="comparison-table" style={{ gridTemplateColumns: `120px repeat(${comparison.length}, minmax(160px, 1fr))` }}>
        <div className="th">항목</div>
        {comparison.map((subject) => <div className="th" key={subject.id}>{subject.name}</div>)}
        <div>교과군</div>
        {comparison.map((subject) => <div key={`${subject.id}-group`}>{subject.group}</div>)}
        <div>선택 유형</div>
        {comparison.map((subject) => <div key={`${subject.id}-type`}>{subject.selectionType}</div>)}
        <div>학점</div>
        {comparison.map((subject) => <div key={`${subject.id}-credit`}>{subject.creditLabel}</div>)}
        <div>평가</div>
        {comparison.map((subject) => <div key={`${subject.id}-eval`}>{subject.evaluation}</div>)}
        <div>키워드</div>
        {comparison.map((subject) => <div key={`${subject.id}-key`}>{subject.keywords.map((keyword) => `#${keyword}`).join(" ")}</div>)}
      </div>
    </div>
  );
}

function DreamDureView({ setView }: { setView: (view: View) => void }) {
  return (
    <section className="content-page">
      <div className="page-title">
        <span className="eyebrow">DreamDure</span>
        <h1>꿈두레 공동교육과정</h1>
        <p>인천논현고에 개설되지 않은 과목도 공동교육과정을 통해 수강 가능성을 확인할 수 있습니다.</p>
      </div>
      <div className="info-band">
        <GraduationCap size={28} />
        <div>
          <strong>학교 교육과정 안에서 최선의 선택을 찾는 보완 경로</strong>
          <p>
            모든 학교가 모든 선택 과목을 개설할 수는 없습니다. 관심 진로에 필요한 과목이 본교에 없을 때는
            꿈두레 공동교육과정, 온라인 수업, 교사 상담을 함께 검토합니다.
          </p>
        </div>
      </div>
      <div className="dream-grid">
        {dreamDureTypes.map((item) => (
          <article className="dream-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <ul className="check-list">
              {item.checklist.map((check) => <li key={check}>{check}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <div className="dream-courses">
        <div className="section-heading compact">
          <span className="eyebrow">Open Course Guide</span>
          <h2>꿈두레에서 확인해 볼 대표 개설과목</h2>
          <p>아래 과목은 탐색용 예시입니다. 실제 개설 여부, 수업 방식, 신청 기간은 학기별 공지와 상담을 통해 확인합니다.</p>
        </div>
        <div className="dream-course-grid">
          {dreamDureSubjects.map((item) => (
            <article className="dream-course-card" key={item.id}>
              <div className="dream-course-head">
                <span>{item.type}</span>
                <h3>{item.category}</h3>
              </div>
              <div className="course-chip-row">
                {item.subjects.map((subject) => (
                  <span key={subject}>{subject}</span>
                ))}
              </div>
              <p>{item.fit}</p>
              <small>{item.note}</small>
            </article>
          ))}
        </div>
      </div>
      <div className="dream-consult">
        <h2>상담 때 확인할 것</h2>
        <ul className="check-list">
          <li>본교 과목으로 대체 가능한지 먼저 확인합니다.</li>
          <li>공동교육과정 과목이 생활기록부에 어떤 방식으로 기재되는지 확인합니다.</li>
          <li>정규 시간표, 방과후 시간, 이동 거리, 온라인 접속 환경을 함께 점검합니다.</li>
          <li>신청 인원 초과 시 선발 기준이 있는지 확인합니다.</li>
        </ul>
      </div>
      <div className="dream-steps">
        <h2>신청 전 확인 흐름</h2>
        <ol>
          <li>관심 과목이 본교 교육과정에 개설되어 있는지 확인합니다.</li>
          <li>미개설 과목이면 꿈두레 공동교육과정 개설 여부를 확인합니다.</li>
          <li>수업 시간, 이동, 평가, 출결 조건을 담임 선생님과 상담합니다.</li>
          <li>나의 교육과정 설계에 반영하고 최종 선택 전 다시 점검합니다.</li>
        </ol>
        <button className="primary-button" type="button" onClick={() => setView("planner")}>
          나의 설계에서 점검하기
        </button>
      </div>
    </section>
  );
}

function ResourcesView() {
  return (
    <section className="content-page">
      <div className="page-title">
        <span className="eyebrow">Resources</span>
        <h1>자료실</h1>
        <p>원본 워크북과 상담 자료를 확인합니다.</p>
      </div>
      <div className="resource-grid">
        <a href="./2026 교육과정박람회(인천논현고)_1학년.pdf" target="_blank" rel="noreferrer">
          <BookOpen size={24} />
          <strong>1학년 과목 선택 워크북</strong>
          <span>PDF 열기</span>
        </a>
        <a href="./2026 교육과정박람회(인천논현고)_2학년.pdf" target="_blank" rel="noreferrer">
          <BookOpen size={24} />
          <strong>2학년 과목 선택 워크북</strong>
          <span>PDF 열기</span>
        </a>
        <a href="https://nh.icehs.kr" target="_blank" rel="noreferrer">
          <GraduationCap size={24} />
          <strong>인천논현고 홈페이지</strong>
          <span>학교 홈페이지 이동</span>
        </a>
      </div>
    </section>
  );
}

export default App;
