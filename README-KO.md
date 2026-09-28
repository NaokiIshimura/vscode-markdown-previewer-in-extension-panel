# Markdown Previewer in Extension Area

[![Version](https://img.shields.io/badge/version-1.1.2-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel) [![VS Code](https://img.shields.io/badge/VS%20Code-1.74.0%2B-blue)](https://code.visualstudio.com/) [![VS Marketplace](https://img.shields.io/badge/VS%20Marketplace-Install-blue)](https://marketplace.visualstudio.com/items?itemName=nacn.markdown-previewer-in-extension-panel)

[English](README.md) | [日本語](README-JA.md) | 한국어 | [简体中文](README-ZH-CN.md) | [繁體中文](README-ZH-TW.md) | [Português (BR)](README-PT-BR.md)

확장 영역(기본 사이드바, 보조 사이드바 또는 패널)에 모든 기능을 갖춘 Markdown 미리보기를 표시하여, 편집기 탭을 오가지 않고도 문서를 읽고 탐색할 수 있는 VS Code 확장 프로그램입니다.

## 기능

### 🎯 확장 영역 표시

기본 사이드바, 보조 사이드바 또는 패널에 표시할 수 있습니다.

![demo3](assets/demo3.gif)

| 기능 | 단축키 | 설명 |
| --- | --- | --- |
| 이전/다음 파일로 이동 | `←` / `→` | 같은 디렉터리의 이전/다음 Markdown 파일로 이동 |
| 고정/고정 해제 | `p` | 현재 표시 중인 Markdown 파일에 미리보기를 고정하거나 추적 모드로 돌아감 |
| 편집 | `e` | 미리보기 중인 문서를 편집기 탭에서 열기 |
| 파일 경로 복사 | 경로 클릭 | 파일 경로를 클릭하여 클립보드에 복사. VS Code 알림 메시지가 표시됨 |
| 설정 열기 | 툴바 전용 | 확장 프로그램의 설정 화면으로 이동 |


### 🎨 풍부한 미리보기 경험

쾌적한 열람을 위한 다양한 기능을 제공합니다.

![demo2](assets/demo2.gif)

| 기능 | 단축키 | 설명 |
| --- | --- | --- |
| 라이트/다크 테마 | `t` | 미리보기의 라이트/다크 테마 전환 |
| 확대/축소 | `+` / `-` | 미리보기 확대/축소(현재 확대 수준 표시) |
| 확대 수준 초기화 | `r` | 확대 수준을 100%로 초기화 |
| Mermaid 다이어그램 | 자동 | Mermaid 다이어그램(플로차트, 시퀀스 다이어그램, 클래스 다이어그램 등)을 미리보기에서 직접 렌더링 |
| Mermaid 복사 | 호버 툴바 | Mermaid 다이어그램 소스를 Markdown 코드 블록으로 클립보드에 복사 |
| Mermaid 저장 | 호버 툴바 | VS Code 저장 대화상자를 통해 Mermaid 다이어그램을 PNG 이미지로 저장 |
| 코드 구문 강조 | 자동 | 언어를 지정한 펜스 코드 블록에 언어별 색상 적용(예: <code>```javascript</code>) |
| 코드 블록 복사 | 호버 툴바 | 펜스 코드 블록 전체를 클릭 한 번으로 클립보드에 복사 |
| 선택한 텍스트 복사 | `c` | 선택한 텍스트를 클립보드에 복사. VS Code 알림 메시지가 표시됨 |
| 인용으로 복사 | `q` | 선택한 텍스트의 각 줄 앞에 `> `를 붙여 복사하여 Markdown 인용에 활용 |
| 파일 경로 표시 | 항상 표시 | 미리보기 상단에 프로젝트 루트 기준 상대 경로 표시 |
| 테마 대응 스크롤바 | 자동 | 스크롤바가 현재 라이트/다크 테마에 맞춰 표시되어 가독성 향상 |
| 링크 컨텍스트 메뉴 | 링크 우클릭 | `http`/`https` 링크를 기본 브라우저 또는 VS Code 내장 Simple Browser 중에서 선택하여 열기 |

### 🗂️ 사이드바 기능

네 개의 탭(아웃라인, 파일, 기록, 도움말)으로 다양한 정보를 확인할 수 있습니다.

| 탭 | 단축키 | 설명 |
| --- | --- | --- |
| 사이드바 | `s` | 아웃라인, 파일, 기록, 도움말 탭이 있는 사이드바 패널 표시/숨기기. Tab으로 탭 전환, ↑/↓로 항목 이동, Enter로 선택, Esc로 닫기 |
| 아웃라인 | `o` | 사이드바를 열고 아웃라인 탭 표시. 현재 파일명과 h1-h6 내비게이션 표시. ↑/↓로 이동, Enter로 선택, Esc로 닫기 |
| 파일 | `f` | 사이드바를 열고 파일 목록 탭 표시. 같은 디렉터리의 Markdown 파일을 표시하여 빠르게 이동. ↑/↓로 이동, Enter로 선택, Esc로 닫기 |
| 파일 정렬 | `a` | 파일 정렬 순서를 이름순(알파벳순)과 수정일순(최신순) 사이에서 전환 |
| 기록 | `h` | 사이드바를 열고 기록 탭 표시. 최근 미리본 파일을 표시하여 빠르게 이동. ↑/↓로 이동, Enter로 선택, Esc로 닫기 |
| 도움말 | Tab 키 | 사이드바 도움말 탭에서 모든 기능과 키보드 단축키 확인. 사이드바가 열려 있을 때 Tab 키로 접근 |

**참고**: 키보드 단축키는 미리보기에 포커스가 있을 때만 동작합니다.

## 설정

| 설정 | 기본값 | 설명 |
| --- | --- | --- |
| `markdownPreviewInExtensionPanel.defaultZoomLevel` | `100` | 기본 확대 비율(50–200) |
| `markdownPreviewInExtensionPanel.themeMode` | `auto` | 미리보기 테마 모드(`auto`, `light`, `dark`) |
| `markdownPreviewInExtensionPanel.fileSortOrder` | `name` | 파일 탭의 파일 정렬 순서(`name`, `modified`) |
| `markdownPreviewInExtensionPanel.scrollSync` | `true` | 소스 편집기와 미리보기 간 스크롤 동기화(양방향). 소스 편집기가 미리보기와 함께 표시되어 있어야 합니다. |

## 요구 사항
- Visual Studio Code 1.74.0 이상
- 현재 워크스페이스 내 Markdown 파일(`.md`)

## 개발
```bash
npm install      # 의존성 설치
npm run compile  # ./out으로 단일 빌드
npm run watch    # 개발 중 증분 빌드
npm test         # 단위 테스트 실행
```
VS Code 확장 개발 호스트(`F5`)를 실행하면 샌드박스 창에서 변경 사항을 바로 확인할 수 있습니다.

## 팁 및 알려진 제한 사항
- **사이드바**: `s`를 눌러 아웃라인, 파일, 기록, 도움말을 탭 형식으로 묶은 사이드바 패널을 표시/숨길 수 있습니다. Tab으로 탭 전환, ↑/↓로 항목 이동, Enter로 선택, Esc로 닫습니다.
- **아웃라인**: `o`를 눌러 사이드바를 열고 아웃라인 탭을 표시합니다. 탭 상단에 현재 파일명이 구분선과 함께 표시되고, 그 아래에 Markdown 문서에서 추출한 h1-h6 제목이 클릭 가능한 내비게이션으로 표시됩니다.
- **파일 목록**: `f`를 눌러 사이드바를 열고 파일 목록 탭을 표시합니다. 현재 파일과 같은 디렉터리의 모든 Markdown 파일이 표시되며 현재 파일은 강조 표시됩니다. 파일을 클릭하면 해당 파일로 전환됩니다. `a`를 눌러 이름순과 수정일순 정렬을 전환할 수 있습니다.
- **기록**: `h`를 눌러 사이드바를 열고 기록 탭을 표시합니다. 최근 미리본 Markdown 파일이 시간순(최신순)으로 표시됩니다. 파일을 클릭하여 전환하거나 Clear 버튼으로 모든 기록을 삭제할 수 있습니다.
- **도움말**: 사이드바의 도움말 탭에서 모든 기능과 키보드 단축키의 빠른 참조를 제공합니다. Tab 키로 사이드바 탭을 순환하여 접근할 수 있습니다.
- 파일 목록 탭은 디렉터리에 Markdown 파일이 2개 이상 있을 때만 표시됩니다.
- 사이드바가 열려 있을 때 ↑/↓로 항목을 이동하고, Enter로 선택하고, Esc로 닫습니다.
- 좌우 화살표 키(←/→)는 사이드바가 열려 있어도 항상 이전/다음 Markdown 파일로 이동합니다.
- Mermaid 다이어그램은 jsDelivr CDN에서 로드되므로 오프라인 환경에서는 다이어그램 렌더링이 생략됩니다.
- 이미지와 링크는 VS Code 워크스페이스 경로를 사용하여 해석됩니다. 참조된 파일이 접근 가능한 위치에 있는지 확인하세요.
- Markdown 파일이 열려 있지 않으면 워크스페이스의 README.md가 있을 경우 자동으로 미리보기에 표시됩니다.
- Markdown이 아닌 파일로 전환해도 미리보기가 유지되므로, 코드 작업 중에도 문서를 계속 볼 수 있습니다.
- 다른 파일로 전환해도 사이드바가 계속 표시되어 탐색 상태가 유지됩니다.
- 다른 Markdown 파일로 전환하면 스크롤 위치가 자동으로 맨 위로 초기화됩니다.
- 인용으로 복사 기능은 이슈, 풀 리퀘스트 또는 다른 Markdown 문서에서 내용을 인용할 때 유용합니다.

## 피드백
버그 신고나 기능 요청은 GitHub Issues를 통해 해 주세요. 스크린샷과 간결한 재현 절차를 함께 알려 주시면 빠르게 대응하는 데 도움이 됩니다.
