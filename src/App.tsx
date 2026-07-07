import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  GraduationCap,
  LibraryBig,
  Menu,
  Search,
  ScrollText,
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

type View = "dashboard" | "guide" | "subjects" | "matching" | "planner" | "dreamdure" | "howto" | "qna" | "resources";

const navItems: Array<{ id: View; label: string }> = [
  { id: "dashboard", label: "홈" },
  { id: "howto", label: "활용방법" },
  { id: "guide", label: "고교학점제" },
  { id: "subjects", label: "과목 백과" },
  { id: "matching", label: "진로 매칭" },
  { id: "planner", label: "나의 설계" },
  { id: "dreamdure", label: "꿈두레" },
  { id: "qna", label: "QnA" },
  { id: "resources", label: "자료실" },
];

const qnaFormUrl = "https://forms.gle/HEaTQ2BRJ5A9EidL7";

const gradeLabels: Record<Grade | "all", string> = {
  all: "전체",
  1: "2학년",
  2: "3학년",
};

const statCards = [
  { label: "총 이수 학점", value: "192", note: "교과 174 + 창체 18" },
  { label: "필수 이수 학점", value: "84+", note: "교과군별 기준 확인" },
  { label: "국·수·영 제한", value: "81", note: "초과 불가" },
  { label: "선택 과목", value: "63", note: "1학년 28개, 2학년 35개" },
];

const guideSteps = [
  { title: "이수 기준 확인", text: "졸업, 필수 이수 학점, 국수영 제한을 먼저 확인합니다." },
  { title: "진로·학과 탐색", text: "관심 계열과 학과에서 요구하는 역량을 살펴봅니다." },
  { title: "과목 선택 및 상담", text: "후보 과목을 담고 담임·교과·진로 선생님과 상담합니다." },
  { title: "학업 계획 관리", text: "선택 이유와 학습 계획을 남기고 필요하면 보완합니다." },
];

const courseTypes = [
  { title: "공통 과목", text: "기초소양과 기본학력을 보장하기 위한 과목으로 주로 1학년에 이수합니다." },
  { title: "일반 선택", text: "교과별 주요 학습 내용을 이해하고 탐구하는 기본 선택 과목입니다." },
  { title: "진로 선택", text: "교과별 심화 학습과 진로 관련 역량을 키우는 과목입니다." },
  { title: "융합 선택", text: "교과 안팎의 주제를 연결하고 실생활 문제를 응용해 보는 과목입니다." },
];

const evaluationTypes = [
  { title: "보통 교과", text: "원점수, 성취도, 석차등급, 성취도별 분포비율, 과목평균, 수강자수가 기재됩니다." },
  { title: "사회·과학 융합 선택", text: "성취도와 통계정보가 중심이며, 석차등급 기재 방식은 과목별로 확인합니다." },
  { title: "체육·예술 일부 과목", text: "성취도 3단계로 평가되는 과목이 있으므로 과목별 평가 정보를 확인합니다." },
  { title: "교양 과목", text: "주로 P 이수 여부 중심으로 기재됩니다." },
];

const admissionFactors = [
  { title: "학업역량", text: "이수한 교과의 성취수준, 학업태도, 탐구력을 종합적으로 봅니다." },
  { title: "진로역량", text: "희망 전공과 관련된 과목을 선택하고 성취한 과정, 진로 탐색 경험을 봅니다." },
  { title: "공동체역량", text: "협업, 소통, 나눔과 배려, 성실성, 규칙 준수, 리더십을 함께 살핍니다." },
];

const designGuide = [
  { title: "나의 이해", text: "어떤 과목을 배울 때 즐거운지, 무엇을 잘하는지 먼저 정리합니다." },
  { title: "과목·학과 탐색", text: "관심 학과의 요구 역량, 대학 권장과목, 졸업 후 진로를 함께 확인합니다." },
  { title: "설계와 상담", text: "후보 과목을 담고 학점 기준, 위계 과목, 학교 개설 여부를 상담합니다." },
  { title: "심화 학습", text: "선택 과목에서 해 보고 싶은 탐구 활동과 학업 계획을 구체화합니다." },
];

const audienceGuides = [
  { title: "학생", text: "관심 키워드나 계열로 과목을 찾고, 후보 과목을 담아 학점 기준을 점검합니다." },
  { title: "학부모", text: "고교학점제 기준, 성적 산출 방식, 대입과 과목 선택의 관계를 먼저 확인합니다." },
  { title: "상담 전", text: "희망 진로, 고민 과목, 선택 이유를 메모해 담임·교과·진로 선생님과 상담합니다." },
];

const howToSteps = [
  { title: "기준 이해하기", text: "먼저 고교학점제 메뉴에서 192학점, 필수 이수 학점, 국·수·영 81학점 제한을 확인합니다.", action: "고교학점제 보기", view: "guide" as View },
  { title: "과목 찾기", text: "과목 백과에서 개설 학기, 교과군, 선택 유형, 관심 계열, 키워드로 후보 과목을 좁힙니다.", action: "과목 백과 열기", view: "subjects" as View },
  { title: "상세 비교하기", text: "과목 카드를 눌러 한 줄 소개, 주요 키워드, 학습 활동, 추천 학생을 확인합니다.", action: "과목 탐색하기", view: "subjects" as View },
  { title: "설계함에 담기", text: "관심 과목은 담기 버튼으로 저장하고, 나의 설계에서 학기별로 배치합니다.", action: "나의 설계 열기", view: "planner" as View },
  { title: "진로와 연결하기", text: "진로 매칭에서 내 과목이 관심 계열과 어떻게 연결되는지 보고 권장과목 예시를 확인합니다.", action: "진로 매칭 보기", view: "matching" as View },
  { title: "상담 준비하기", text: "상담 질문 칸에 고민 과목, 선택 이유, 선생님께 물어볼 내용을 적고 출력합니다.", action: "상담 준비하기", view: "planner" as View },
];

const routeGuides = [
  { title: "아직 진로가 뚜렷하지 않다면", text: "키워드 검색에서 흥미 있는 말부터 눌러 보고, 마음이 가는 과목을 3개 이상 담아 비교합니다." },
  { title: "희망 학과가 있다면", text: "진로 매칭에서 관심 계열을 먼저 확인한 뒤, 과목 백과에서 관련 과목의 학습 활동을 읽어 봅니다." },
  { title: "과목이 너무 많아 헷갈린다면", text: "개설 학기 필터를 먼저 선택하고, 교과군과 선택 유형을 하나씩 좁혀 봅니다." },
  { title: "학교에 없는 과목이 궁금하다면", text: "공동교육 메뉴에서 주변 꿈두레 운영 현황을 확인하고 상담 때 개설 여부를 질문합니다." },
];

const consultChecklist = [
  "내가 담은 과목이 희망 진로 또는 관심 계열과 어떻게 연결되는지 설명할 수 있나요?",
  "국어·수학·영어 과목 쏠림이나 학점 기준 위반 가능성은 없는지 확인했나요?",
  "Ⅰ·Ⅱ 과목처럼 학습 순서가 필요한 과목은 없는지 살펴봤나요?",
  "고민 중인 과목 2~3개를 비교하고 질문을 적어 두었나요?",
  "꿈두레나 온라인 수업이 필요한 과목은 담임 선생님과 상담할 준비가 되었나요?",
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
        {view === "howto" && <HowToView setView={setView} />}
        {view === "qna" && <QnaView />}
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
              2학년 1학기 과목 보기
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
              3학년 1학기 과목 보기
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
          <span>1·2학년 워크북 기준 63개 과목 탐색</span>
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
        <button type="button" onClick={() => setView("howto")}>
          <ScrollText size={24} />
          <strong>사이트 활용방법</strong>
          <span>과목 선택 준비 순서를 따라가기</span>
        </button>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <span className="eyebrow">Before You Choose</span>
          <h2>과목 선택, 이렇게 시작하세요</h2>
          <p>과목 선택은 단순히 시간표를 고르는 일이 아니라 진로 탐색, 대입 준비, 학업 계획을 함께 세우는 과정입니다.</p>
        </div>
        <div className="audience-grid">
          {audienceGuides.map((item) => (
            <article className="mini-info-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

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
        <p>과목 선택 전 학생과 학부모가 함께 확인해야 할 공통 내용을 정리했습니다.</p>
      </div>
      <div className="info-band">
        <GraduationCap size={28} />
        <div>
          <strong>고교학점제란?</strong>
          <p>
            학생이 진로와 적성에 따라 과목을 선택하고, 이수 기준에 도달한 과목의 학점을 취득·누적하여
            졸업하는 제도입니다. 과목 선택은 자신의 진로를 탐색하고 책임 있게 학업을 설계하는 과정입니다.
          </p>
        </div>
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
      <div className="section-block flush">
        <div className="section-heading compact">
          <span className="eyebrow">Course Types</span>
          <h2>2022 개정 교육과정 과목 구조</h2>
          <p>공통 과목은 주로 1학년에, 선택 과목은 주로 2·3학년에 이수합니다.</p>
        </div>
        <div className="type-grid">
          {courseTypes.map((item) => (
            <article className="mini-info-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
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
          <h2>필수 이수 학점</h2>
          <ul className="check-list">
            <li>국어·수학·영어·사회는 각 8학점 이상</li>
            <li>한국사는 6학점 이상</li>
            <li>과학·체육·예술은 각 10학점 이상</li>
            <li>기술·가정/정보/제2외국어/한문/교양은 총 16학점 이상</li>
          </ul>
        </div>
      </div>
      <div className="notice-panel">
        <strong>선택 전 꼭 확인하세요</strong>
        <ul className="check-list">
          <li>국어·수학·영어 교과군 이수학점 총합은 꿈두레, 온라인학교, 소인수 교육과정을 포함해 제한 기준을 넘을 수 없습니다.</li>
          <li>Ⅰ·Ⅱ로 표시된 위계 과목은 일반적으로 Ⅰ을 먼저 이수한 뒤 Ⅱ를 선택해야 합니다.</li>
          <li>신청 인원, 교사 수급, 학교 시설 여건에 따라 선택한 과목이 개설되지 않을 수 있습니다.</li>
        </ul>
      </div>
      <div className="section-block flush">
        <div className="section-heading compact">
          <span className="eyebrow">Evaluation</span>
          <h2>성적 산출 방식</h2>
          <p>과목 유형에 따라 원점수, 성취도, 석차등급, 통계정보, P 이수 여부가 다르게 기재됩니다.</p>
        </div>
        <div className="type-grid">
          {evaluationTypes.map((item) => (
            <article className="mini-info-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
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
        <div className="card-actions">
          {subject.videoUrl && (
            <a className="video-link" href={subject.videoUrl} target="_blank" rel="noreferrer" aria-label={`${subject.name} 영상 보기`}>
              <ExternalLink size={15} />
              영상
            </a>
          )}
          <button className={isSelected ? "selected-button" : "add-button"} type="button" onClick={onToggle}>
            {isSelected ? "담김" : "담기"}
          </button>
        </div>
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
        {subject.videoUrl && (
          <a className="video-link detail-video-link" href={subject.videoUrl} target="_blank" rel="noreferrer" title={subject.videoTitle}>
            <ExternalLink size={16} />
            과목 영상 보기
          </a>
        )}
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
      <div className="match-panel">
        <h2>대입에서 과목 선택을 보는 이유</h2>
        <p className="muted-text">
          대학은 학생이 희망 전공과 관련된 과목을 어떻게 선택하고, 그 과목에서 어떤 배움과 성장을 만들었는지를
          진로역량의 중요한 근거로 봅니다. 권장과목은 합격 보증이 아니라 전공 탐색을 위한 안내 자료입니다.
        </p>
        <div className="admission-factor-grid">
          {admissionFactors.map((item) => (
            <article className="mini-info-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
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
        <p>관심 과목을 담아 학점 기준을 점검하고, 학업 계획서와 상담 질문을 함께 준비합니다.</p>
      </div>
      <div className="section-block flush">
        <div className="section-heading compact">
          <span className="eyebrow">Academic Plan</span>
          <h2>성공적인 교육과정 설계 흐름</h2>
          <p>워크북의 학업 설계 흐름을 따라 나를 이해하고, 과목을 탐색하고, 상담을 거쳐 계획을 보완합니다.</p>
        </div>
        <div className="type-grid">
          {designGuide.map((item) => (
            <article className="mini-info-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
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
          <p className="muted-text">선택 과목의 이수 기준은 2/3 이상 출석입니다. 선택 이유와 심화 학습 계획까지 함께 적어 보세요.</p>
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
          <h2>우리 학교 주변 꿈두레 교육과정 운영 현황</h2>
          <p>아래 내용은 워크북에 제시된 학교별 개설 과목입니다. 신청 전에는 꿈맵핑과 학교 상담을 통해 최종 운영 여부를 확인합니다.</p>
        </div>
        <div className="dream-course-table">
          <div className="dream-course-row head">
            <span>학교명</span>
            <span>유형</span>
            <span>1학기</span>
            <span>2학기</span>
          </div>
          {dreamDureSubjects.map((item) => (
            <div className="dream-course-row" key={item.id}>
              <strong>{item.school}</strong>
              <span className="type-pill">{item.type}</span>
              <CourseList names={item.firstSemester} />
              <CourseList names={item.secondSemester} />
            </div>
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

function CourseList({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <span className="empty-course">-</span>;
  }

  return (
    <div className="course-chip-row">
      {names.map((name) => (
        <span key={name}>{name}</span>
      ))}
    </div>
  );
}

function HowToView({ setView }: { setView: (view: View) => void }) {
  return (
    <section className="content-page">
      <div className="page-title">
        <span className="eyebrow">How To Use</span>
        <h1>사이트 활용방법</h1>
        <p>과목 선택을 처음 시작하는 학생도 순서대로 따라 할 수 있도록 사용 흐름을 정리했습니다.</p>
      </div>

      <div className="info-band">
        <ScrollText size={28} />
        <div>
          <strong>목표는 최종 선택이 아니라 상담 준비입니다</strong>
          <p>
            이 사이트는 실제 수강 신청 시스템이 아니라, 관심 과목을 탐색하고 학점 기준을 점검하며 상담 질문을
            정리하는 도구입니다. 최종 선택 전에는 반드시 담임·교과·진로 선생님과 상담하세요.
          </p>
        </div>
      </div>

      <div className="howto-steps">
        {howToSteps.map((step, index) => (
          <article className="howto-step-card" key={step.title}>
            <span>{index + 1}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
              <button type="button" onClick={() => setView(step.view)}>
                {step.action}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="section-block flush">
        <div className="section-heading compact">
          <span className="eyebrow">Choose Your Route</span>
          <h2>상황별 추천 활용 루트</h2>
        </div>
        <div className="type-grid">
          {routeGuides.map((item) => (
            <article className="mini-info-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="notice-panel">
        <strong>상담 전에 스스로 확인할 체크리스트</strong>
        <ul className="check-list">
          {consultChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="howto-actions">
        <button className="primary-button" type="button" onClick={() => setView("subjects")}>
          과목 찾기 시작
          <ChevronRight size={18} />
        </button>
        <button className="secondary-button" type="button" onClick={() => setView("planner")}>
          나의 설계 확인
        </button>
      </div>
    </section>
  );
}

function QnaView() {
  const faqItems = [
    {
      question: "질문을 남기면 바로 공개되나요?",
      answer: "아니요. 제출된 질문은 선생님이 먼저 확인한 뒤, 여러 학생에게 도움이 되는 내용만 정리해 공개합니다.",
    },
    {
      question: "개인 상담이 필요한 내용도 적어도 되나요?",
      answer: "가능합니다. 다만 민감한 개인정보나 성적 정보는 자세히 쓰지 말고, 상담 때 직접 확인할 수 있도록 질문만 간단히 남겨 주세요.",
    },
    {
      question: "답변은 어디에서 확인하나요?",
      answer: "반복되는 질문은 이 QnA 페이지의 자주 묻는 질문 영역에 정리해 안내할 예정입니다.",
    },
  ];

  return (
    <section className="content-page">
      <div className="page-title">
        <span className="eyebrow">QnA</span>
        <h1>궁금한 점 남기기</h1>
        <p>과목 선택, 학점 기준, 진로와 과목 연결처럼 혼자 판단하기 어려운 내용을 질문으로 남길 수 있습니다.</p>
      </div>

      <div className="info-band">
        <CheckCircle2 size={28} />
        <div>
          <strong>질문은 Google Form으로 받습니다</strong>
          <p>
            제출된 질문은 선생님이 확인한 뒤 상담 자료와 자주 묻는 질문으로 정리합니다. 이름, 학번, 성적처럼
            불필요한 개인정보는 적지 않아도 됩니다.
          </p>
        </div>
      </div>

      <div className="resource-section">
        <h2>질문하기</h2>
        <div className="resource-grid link-grid">
          <a className="resource-card link" href={qnaFormUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>QnA 질문 남기기</strong>
            <span>Google Form 열기</span>
          </a>
          <article className="resource-card qna-note">
            <CheckCircle2 size={24} />
            <strong>질문 예시</strong>
            <span>이 과목이 제 진로와 맞나요?</span>
            <span>2학년 때 꼭 들어야 할 과목이 있나요?</span>
          </article>
          <article className="resource-card qna-note">
            <ScrollText size={24} />
            <strong>답변 운영</strong>
            <span>개별 상담이 필요한 내용은 담임 선생님과 연결해 확인합니다.</span>
          </article>
        </div>
      </div>

      <div className="section-block flush">
        <div className="section-heading compact">
          <span className="eyebrow">FAQ</span>
          <h2>자주 묻는 질문</h2>
        </div>
        <div className="type-grid">
          {faqItems.map((item) => (
            <article className="mini-info-card" key={item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
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
        <p>원본 워크북과 상담 자료를 확인합니다. 1~23쪽 공통 안내에는 고교학점제, 과목 선택 절차, 대입 연계, 학업 설계, 꿈두레 공동교육과정 안내가 담겨 있습니다.</p>
      </div>
      <div className="resource-section">
        <h2>PDF 자료</h2>
        <div className="resource-grid">
          <a className="resource-card file" href="./2026 교육과정박람회(인천논현고)_1학년.pdf" target="_blank" rel="noreferrer">
            <BookOpen size={24} />
            <strong>1학년 과목 선택 워크북</strong>
            <span>PDF 열기</span>
          </a>
          <a className="resource-card file" href="./2026 교육과정박람회(인천논현고)_2학년.pdf" target="_blank" rel="noreferrer">
            <BookOpen size={24} />
            <strong>2학년 과목 선택 워크북</strong>
            <span>PDF 열기</span>
          </a>
          <a className="resource-card file" href="./2026학년도 입학생 교육과정편성표.pdf" target="_blank" rel="noreferrer">
            <BookOpen size={24} />
            <strong>2026학년도 입학생 교육과정편성표</strong>
            <span>운영학점 확인</span>
          </a>
          <a className="resource-card file" href="./2025학년도 입학생 교육과정편성표.pdf" target="_blank" rel="noreferrer">
            <BookOpen size={24} />
            <strong>2025학년도 입학생 교육과정편성표</strong>
            <span>운영학점 확인</span>
          </a>
        </div>
      </div>
      <div className="resource-section">
        <h2>유용한 링크</h2>
        <div className="resource-grid link-grid">
          <a className="resource-card link" href="https://nh.riroschool.kr/" target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>리로스쿨(선택과목 수강 신청)</strong>
            <span>실제 과목 선택</span>
          </a>
          <a className="resource-card link" href="https://hikimho.github.io/-/" target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>고등학교 과목 선택 내비게이션</strong>
            <span>과목 선택 참고</span>
          </a>
          <a className="resource-card link" href="https://nh.icehs.kr" target="_blank" rel="noreferrer">
            <GraduationCap size={24} />
            <strong>인천논현고 홈페이지</strong>
            <span>학교 홈페이지 이동</span>
          </a>
          <a className="resource-card link" href="https://www.career.go.kr" target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>커리어넷</strong>
            <span>진로·직업 정보 탐색</span>
          </a>
          <a className="resource-card link" href="https://www.adiga.kr" target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>대입정보포털 어디가</strong>
            <span>대학·전형 정보 확인</span>
          </a>
          <a className="resource-card link" href="https://www.schoolinfo.go.kr" target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>학교알리미</strong>
            <span>학교 정보 공시</span>
          </a>
          <a className="resource-card link" href="https://www.work24.go.kr" target="_blank" rel="noreferrer">
            <ExternalLink size={24} />
            <strong>고용24</strong>
            <span>직업·고용 정보 확인</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default App;
