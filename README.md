# 인천논현고 2026 교육과정박람회 웹사이트

React + TypeScript + Vite로 제작한 정적 웹앱입니다.

## 주요 기능

- 홈 대시보드
- 고교학점제 핵심 안내
- 1학년/2학년 선택 과목 백과
- 과목명, 교과군, 선택 유형, 관심 계열, 키워드 필터
- 과목 상세 보기
- 관심 과목 담기
- 과목 비교
- 학점 기준 점검과 경고
- 대학·학과별 권장과목 예시 매칭
- 꿈두레 공동교육과정 안내
- 상담 질문 메모
- 원본 PDF 자료실

## 실행

```bash
npm install
npm run dev
```

프로젝트 루트의 `index.html`은 Vite 개발 서버용 파일입니다. 이 파일을 더블클릭해서 열면 앱이 정상 실행되지 않을 수 있습니다. 개발 중에는 `npm run dev`, 배포 확인은 `npm run build` 후 `dist` 또는 `docs` 폴더를 사용합니다.

## 빌드

```bash
npm run build
```

빌드 결과는 `dist` 폴더에 생성됩니다. 현재 앱은 정적 파일만 사용하므로 `dist/index.html`을 직접 열어도 동작합니다.

GitHub Pages용 `docs` 폴더를 만들려면 다음 명령을 사용합니다.

```bash
npm run build:docs
```

## 배포

1차 배포는 GitHub Pages를 권장합니다.

- `npm run build:docs`
- GitHub Pages 설정에서 배포 대상을 `main branch /docs`로 설정
- PDF 파일은 `public` 폴더에 두면 빌드 시 함께 복사됩니다.
