# 숨은 점 찾기 · Find the Hidden Dot

> 손끝으로 다른 촉각 패턴을 찾아 별빛 나무의 다섯 빛을 깨우는, **시각장애 아동을 위한 60×40 닷패드 촉각 탐색 게임**입니다.
> TTS 음성 · 촉각 핀 출력 · 키보드/닷패드 기능키만으로 처음부터 끝까지 플레이할 수 있습니다.

![난이도](https://img.shields.io/badge/난이도-매우_쉬움-0B8800)
![플레이타임](https://img.shields.io/badge/플레이-약_3분-C43D00)
![해상도](https://img.shields.io/badge/DotPad-60×40-081631)
![음성](https://img.shields.io/badge/TTS-TW__TTS_호환-19a8de)
![언어](https://img.shields.io/badge/언어-한국어_·_English-555)
![라이선스](https://img.shields.io/badge/license-MIT-blue)

---

## ▶ 바로 플레이

GitHub Pages 배포 후:

```text
https://<사용자>.github.io/hidden-dot-game/
```

로컬 실행:

```bash
python3 -m http.server 8080
# 또는
npm run dev
```

브라우저에서 `http://localhost:8080/` 접속. **닷패드가 없어도 화면 시뮬레이터 + 키보드 + TTS로 완전히 플레이됩니다.**

임베드/언어 옵션:

```text
/index.html?embed=1&preview=0&lang=ko   # Tactile Worlds 임베드 모드
/index.html?lang=en                     # 영어 음성/자막
```

---

## ♿ 접근성 (이 게임의 핵심)

- **완전 무(無)시각 플레이**: 화면을 보지 않고 촉각 + 음성 + 키보드만으로 시작~완료 가능.
- **3채널 동시 안내**: 모든 정보를 화면 · 촉각(60×40 핀) · 음성(TTS)으로 동시에 전달.
- **TTS**: `window.TW_TTS` 규격 사용. 단독 배포 시 동봉된 `tts.js`(Web Speech API)가 한국어/영어 음성을 제공하고, 중복 발화를 방지합니다. 닷게임즈 임베드 시에는 호스트 TW_TTS에 위임합니다(플랫폼 규격 준수).
- **실패 없는 설계**: 시간 제한·목숨·게임 오버 없음. 오답이 반복되면 방향 힌트 → 정확한 행·열 힌트로 단계적 강화.
- **키보드 = 닷패드 기능키 완전 동등 조작**, 스킵 링크, ARIA live-region, 44px 터치 타깃.

---

## 게임 핵심

- 보통 돌: 가운데 핀 1개
- 숨은 빛: 십자 모양 핀 5개
- 선택 커서: 현재 돌 바깥 네 귀퉁이 핀(깜빡임)
- 손끝으로 특별한 패턴을 찾은 뒤, 방향키/닷패드 키로 같은 위치를 선택하고 확인합니다.
- 단계: 2×2 → 3×2 → 3×3 → 4×3 → 5×4 로 탐색 범위가 커집니다.

## 조작

| 기능 | 키보드 | DotPad |
|---|---|---|
| 왼쪽/오른쪽 | ← / → | Pan Left / Pan Right |
| 위/아래 | ↑ / ↓ | F1 / F2 |
| 위치 확인 | Enter / F3 | F3 |
| 현재 위치 듣기 | Space / F4 | F4 |
| 전체 상황 듣기 | — | Pan All |
| 힌트 | H | — |
| 단계 다시 시작 | R | LPF1 |

---

## 스크린샷 / 아트

`assets/` 폴더:

- `hero-banner-2560x900.jpg` — 상단 히어로용(텍스트 없음)
- `card-thumbnail-600x800.jpg` — 게임 카드용(텍스트 없음)
- `game-introduction.png` / `game-introduction-web.jpg` — 게임 소개
- `key-art-with-title.png` — 타이틀 포함 콘셉트 아트

닷게임즈 등록 배너는 앱이 제목을 자동으로 얹으므로 텍스트 없는 파일을 사용하세요.

---

## 배포

### GitHub Pages (권장, 자동)

`main` 브랜치에 push하면 `.github/workflows/pages.yml`이 자동 배포합니다.
저장소 **Settings → Pages → Build and deployment → Source = GitHub Actions** 로 한 번 설정해 주세요.

### 닷게임즈 호스트 임베드

정적 HTTPS로 올리고 다음 엔트리를 등록합니다.

```text
index.html?embed=1&preview=0&lang=ko
```

---

## 실기기(DotPad) 연결

DotPad SDK 3.0.0 은 독점 파일이라 저장소에 포함되지 않습니다(`.gitignore` 처리).
실기기 테스트 시 아래 위치에 직접 배치하세요.

```text
dotpad-sdk/DotPadSDK-3.0.0.js
```

SDK가 없거나 브라우저가 Web Bluetooth를 지원하지 않으면 화면 시뮬레이터로 계속 플레이됩니다.
실기기 BLE 연결은 HTTPS의 Chrome/Edge에서만 동작합니다.

---

## 호스트 메시지 (임베드)

게임 → 호스트: `ready` / `resize` / `exit` / `game-complete`
호스트 → 게임: `set-lang` / `pause` / `exit`

---

## 프로젝트 구조

```text
index.html            # 타이틀 화면 + 게임 셸 (풀블리드 시네마틱 구조)
tts.js                # 단독 배포용 TW_TTS 호환 음성 모듈
styles/game.css       # 디자인 토큰 · 리셋 · 버튼 시스템
styles/cinematic.css  # 씬 배경 · HUD · 보드 · 다이얼로그 레이아웃
styles/responsive.css # 반응형 · embed · 모션/명암 설정
src/main.js           # 게임 상태 + 렌더링
src/platform/         # runtime · hostBridge · ttsAdapter
src/tactile/frame.js  # 60×40 프레임 생성 + 2×4셀 hex 인코딩
src/input/actions.js
dotgames-manifest.json
.github/workflows/pages.yml
```

자세한 이식/아키텍처는 `ARCHITECTURE.md`, 게임 설계는 `GAME_DESIGN.md` 참고.

## 라이선스

MIT (게임 코드 한정). DotPad SDK는 별도 독점 라이선스이며 본 저장소에 포함되지 않습니다.
