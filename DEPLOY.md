# GitHub Pages 배포 안내

현재 프로젝트는 GitHub Pages의 `main branch /docs` 방식으로 배포할 수 있게 준비되어 있습니다.

## 1. 배포 파일 만들기

```bash
npm run build:docs
```

이 명령을 실행하면 `docs` 폴더에 배포용 파일이 생성됩니다.

## 2. GitHub 저장소에 올리기

Git이 설치되어 있다면:

```bash
git add .
git commit -m "Deploy curriculum fair website"
git branch -M main
git remote add origin 저장소_URL
git push -u origin main
```

Git이 설치되어 있지 않다면 GitHub 웹사이트에서 새 저장소를 만들고, 아래 파일/폴더를 업로드합니다.

- `docs/`
- `src/`
- `public/`
- `index.html`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `README.md`
- `DEPLOY.md`

`node_modules`, `.npm-cache`, `dist`, 로그 파일은 업로드하지 않습니다.

## 3. Pages 설정

GitHub 저장소에서:

1. `Settings`
2. `Pages`
3. `Build and deployment`
4. Source: `Deploy from a branch`
5. Branch: `main`
6. Folder: `/docs`
7. `Save`

잠시 후 `https://계정명.github.io/저장소명/` 주소로 접속할 수 있습니다.

## 4. 배포 후 확인

- 홈 화면이 보이는지
- 과목 백과 검색/필터가 작동하는지
- 나의 설계에서 과목 담기와 학점 경고가 작동하는지
- 자료실 PDF가 열리는지
