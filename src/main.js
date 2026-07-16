import { readRuntime } from "./platform/runtime.js";
import { createHostBridge } from "./platform/hostBridge.js";
import { createTtsAdapter } from "./platform/ttsAdapter.js";
import { buildHiddenDotFrame, matrixToHex } from "./tactile/frame.js";
import { ACTION } from "./input/actions.js";

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const runtime = readRuntime();
  const params = new URLSearchParams(location.search);
  const { embedded, previewOff, language: currentLang } = runtime;
  const hostBridge = createHostBridge({ gameId: "hidden-dot", embedded });
  document.documentElement.lang = currentLang;
  document.body.classList.toggle("embed", embedded);
  document.body.classList.toggle("preview-off", previewOff);

  const COPY = {
    ko: {
      home: "숨은 점 찾기",
      connected: "닷패드 연결됨",
      connect: "닷패드 연결",
      soundOn: "음성 켜짐",
      soundOff: "음성 꺼짐",
      startReady: "게임을 시작할 준비가 됐어요.",
      found: "찾았어요! 특별한 빛 점이 맞아요.",
      miss: "아직 아니에요. 다른 돌을 천천히 만져보세요.",
      current: (r,c) => `${r}행 ${c}열을 선택했어요.`,
      overview: (stage, rows, cols, found) => `${stage}. ${rows}행 ${cols}열 보드예요. ${found}개의 빛을 모았어요. 보통 점 하나와 십자 모양 빛 점을 손끝으로 구별하세요.`,
      connectionFail: "닷패드 연결에 실패했어요. 크롬이나 엣지의 보안 연결에서 다시 시도해 주세요.",
      connectionWait: "닷패드에 연결 중이에요.",
      sdkMissing: "닷패드 SDK를 찾지 못했어요. 화면 시뮬레이터로 계속할 수 있어요.",
      next: "다음 모험",
      finish: "별빛 나무가 다시 깨어났어요! 다섯 개의 빛을 모두 찾았습니다."
    },
    en: {
      home: "Find the Hidden Dot",
      connected: "DotPad connected",
      connect: "Connect DotPad",
      soundOn: "Voice on",
      soundOff: "Voice off",
      startReady: "The game is ready.",
      found: "You found it! That is the special light dot.",
      miss: "Not this one yet. Explore the other stones slowly.",
      current: (r,c) => `Row ${r}, column ${c} selected.`,
      overview: (stage, rows, cols, found) => `${stage}. A ${rows} by ${cols} board. You have collected ${found} lights. Feel for one ordinary dot and one cross-shaped light dot.`,
      connectionFail: "DotPad connection failed. Try again in Chrome or Edge over HTTPS.",
      connectionWait: "Connecting to DotPad.",
      sdkMissing: "DotPad SDK was not found. You can keep playing with the screen simulator.",
      next: "Next adventure",
      finish: "The starlight tree is awake again! You found all five lights."
    }
  }[currentLang];

  const STAGES = [
    { cols: 2, rows: 2, art: "assets/stages/stage-01-firefly-meadow.webp", ko: ["첫 번째 빛", "반딧불 풀밭", "네 개의 돌 가운데 숨어 있는 반딧불 빛을 찾아보세요."], en: ["First light", "Firefly Meadow", "Find the firefly light hidden among four stones."], storyKo: "반딧불들이 다시 길을 밝히기 시작했어요.", storyEn: "The fireflies are lighting the path again." },
    { cols: 3, rows: 2, art: "assets/stages/stage-02-moon-mushroom-path.webp", ko: ["두 번째 빛", "달빛 버섯길", "여섯 개의 버섯 돌 사이에서 달빛 점을 찾아보세요."], en: ["Second light", "Moon Mushroom Path", "Find the moonlight dot among six mushroom stones."], storyKo: "잠든 버섯 등불이 하나씩 켜졌어요.", storyEn: "The sleeping mushroom lamps are glowing again." },
    { cols: 3, rows: 3, art: "assets/stages/stage-03-star-seed-garden.webp", ko: ["세 번째 빛", "별씨앗 정원", "아홉 개의 씨앗 중 특별한 별씨앗을 찾아보세요."], en: ["Third light", "Star Seed Garden", "Find the special star seed among nine seeds."], storyKo: "정원에서 작은 별꽃이 피어났어요.", storyEn: "Tiny star flowers are blooming in the garden." },
    { cols: 4, rows: 3, art: "assets/stages/stage-04-quiet-pond.webp", ko: ["네 번째 빛", "고요한 연못", "열두 개의 물결 돌 중 반짝이는 물방울을 찾아보세요."], en: ["Fourth light", "Quiet Pond", "Find the sparkling drop among twelve ripple stones."], storyKo: "연못에 달빛이 다시 비치기 시작했어요.", storyEn: "Moonlight is shining on the pond again." },
    { cols: 5, rows: 4, art: "assets/stages/stage-05-starlight-tree-hill.webp", ko: ["마지막 빛", "별빛 나무 언덕", "스무 개의 돌 가운데 마지막 별빛 점을 찾아보세요."], en: ["Final light", "Starlight Tree Hill", "Find the final starlight dot among twenty stones."], storyKo: "마지막 빛이 별빛 나무를 향해 날아가요.", storyEn: "The final light is flying back to the starlight tree." }
  ];

  const TUTORIAL = [
    {
      titleKo: "시작 안내", titleEn: "Welcome",
      descKo: "숨은 점 찾기는 약 3분 동안 손끝으로 특별한 점을 찾는 매우 쉬운 게임이에요.",
      descEn: "Find the Hidden Dot is a very easy three-minute tactile search game.",
      visualKo: "게임 이름, 난이도와 진행 방법을 보여줘요.", tactileKo: "아직 닷패드에는 점을 올리지 않아요.", audioKo: "숨은 점 찾기입니다. 손끝으로 특별한 빛 점을 찾아볼까요?",
      visualEn: "The game name, difficulty, and play flow are shown.", tactileEn: "No pins are raised yet.", audioEn: "Find the Hidden Dot. Let us find a special light dot by touch."
    },
    {
      titleKo: "기기·연결 확인", titleEn: "Device check",
      descKo: "닷패드를 연결하거나, 연결 없이 화면 시뮬레이터로 연습할 수 있어요.", descEn: "Connect a DotPad or practice with the on-screen simulator.",
      visualKo: "상단의 닷패드 연결 버튼을 사용할 수 있어요.", tactileKo: "연결되면 현재 단계의 60×40 점 패턴이 출력돼요.", audioKo: "닷패드가 없어도 화면에서 연습할 수 있어요.",
      visualEn: "Use the Connect DotPad button in the top bar.", tactileEn: "After connection, the current 60 by 40 pattern is displayed.", audioEn: "You can practice on screen without a DotPad."
    },
    {
      titleKo: "촉각 패턴 읽기", titleEn: "Read the tactile pattern",
      descKo: "보통 돌은 가운데 점 하나예요. 숨은 빛은 가운데와 위·아래·왼쪽·오른쪽, 모두 다섯 점의 십자 모양이에요.", descEn: "An ordinary stone has one center dot. The hidden light has five dots in a cross.",
      visualKo: "화면에서도 한 점과 십자 모양을 같은 방식으로 보여줘요.", tactileKo: "한 점과 다섯 점의 차이를 천천히 만져봐요.", audioKo: "한 점은 보통 돌, 십자 모양 다섯 점은 숨은 빛이에요.",
      visualEn: "The screen shows the same one-dot and cross patterns.", tactileEn: "Feel the difference between one dot and five dots.", audioEn: "One dot is an ordinary stone. Five dots in a cross are the hidden light."
    },
    {
      titleKo: "조작 익히기", titleEn: "Learn the controls",
      descKo: "손으로 빛 점을 찾은 뒤, 방향키로 선택 테두리를 그 위치까지 옮겨요.", descEn: "After finding the light by touch, move the selection frame to that position.",
      visualKo: "선택된 돌은 밝은 테두리로 표시돼요.", tactileKo: "선택 위치는 돌 바깥 네 귀퉁이의 작은 점으로 표시돼요.", audioKo: "화살표로 이동하고, 현재 위치는 스페이스로 들어보세요.",
      visualEn: "The selected stone has a bright frame.", tactileEn: "Four small corner pins mark the selected position.", audioEn: "Move with the arrows and press Space to hear the current position."
    },
    {
      titleKo: "핵심 규칙", titleEn: "Core rule",
      descKo: "특별한 십자 모양을 찾고 그 위치에서 확인하면 빛 하나를 모아요. 틀려도 게임 오버는 없어요.", descEn: "Confirm the cross-shaped dot to collect one light. There is no game over.",
      visualKo: "현재 위치에서 ‘이곳 확인’을 눌러요.", tactileKo: "F3을 누르면 현재 선택 위치를 확인해요.", audioKo: "십자 모양을 찾으면 확인 버튼을 누르세요.",
      visualEn: "Choose Check this spot at the current position.", tactileEn: "Press F3 to check the selected position.", audioEn: "When you find the cross shape, press the check button."
    },
    {
      titleKo: "첫 판 함께하기", titleEn: "Guided first round",
      descKo: "첫 번째 판은 도티가 방향을 자세히 알려줘요. 잘못 선택해도 바로 다음 힌트를 들을 수 있어요.", descEn: "Dotty gives detailed directions in the first round. A wrong choice simply gives another hint.",
      visualKo: "2×2 보드부터 시작해요.", tactileKo: "네 개의 큰 돌만 올라와 탐색 범위가 작아요.", audioKo: "첫 판은 네 개의 돌뿐이에요. 천천히 시작해요.",
      visualEn: "Start with a 2 by 2 board.", tactileEn: "Only four large stones are raised.", audioEn: "The first round has only four stones. Take your time."
    },
    {
      titleKo: "혼자 해보기", titleEn: "Play on your own",
      descKo: "빛을 찾을수록 보드가 조금씩 커져요. 언제든 힌트와 다시 듣기를 사용할 수 있어요.", descEn: "The board grows slowly as you collect lights. Hints and replay are always available.",
      visualKo: "다섯 개의 별이 모두 켜지면 완성돼요.", tactileKo: "가장 큰 단계도 5×4의 넓고 단순한 배치예요.", audioKo: "준비됐어요. 첫 번째 빛을 찾아볼까요?",
      visualEn: "Complete the game when all five stars are lit.", tactileEn: "The largest stage is still a simple 5 by 4 layout.", audioEn: "You are ready. Let us find the first light."
    }
  ];

  const state = {
    screen: "home",
    stageIndex: 0,
    targetIndex: 0,
    cursorIndex: 0,
    foundCount: 0,
    wrongAttempts: 0,
    tutorialIndex: 0,
    soundOn: true,
    connected: false,
    sdk: null,
    scanner: null,
    keyCodes: null,
    dataCodes: null,
    blinkOn: true,
    sentHex: "",
    stageComplete: false
  };

  function live(message, assertive = false) {
    const el = assertive ? $("#assertiveRegion") : $("#liveRegion");
    el.textContent = "";
    setTimeout(() => { el.textContent = message; }, 25);
  }

  const tts = createTtsAdapter({
    getLanguage: () => currentLang,
    isEnabled: () => state.soundOn,
    announce: live
  });

  function speak(text, options = {}) {
    tts.speak(text, options);
  }

  function setSound(on, announce = true) {
    state.soundOn = !!on;
    const button = $("#soundBtn");
    button.setAttribute("aria-pressed", String(state.soundOn));
    button.innerHTML = `<span aria-hidden="true">${state.soundOn ? "🔊" : "🔇"}</span><span class="label">${state.soundOn ? COPY.soundOn : COPY.soundOff}</span>`;
    if (window.TW_TTS) {
      try { window.TW_TTS.setEnabled(state.soundOn); } catch (_) {}
    }
    if (state.soundOn && announce) speak(COPY.soundOn);
  }

  let audioCtx = null;
  function tone(kind = "move") {
    if (!state.soundOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const frequencies = { move: 330, hint: 520, miss: 180, found: 740 };
      osc.frequency.setValueAtTime(frequencies[kind] || 330, now);
      if (kind === "found") osc.frequency.exponentialRampToValueAtTime(1100, now + .25);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.1, now + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + (kind === "found" ? .34 : .12));
      osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now); osc.stop(now + (kind === "found" ? .36 : .14));
    } catch (_) {}
  }

  function stageText(stage) { return currentLang === "en" ? stage.en : stage.ko; }
  function storyText(stage) { return currentLang === "en" ? stage.storyEn : stage.storyKo; }
  function tutorialText(step, key) { return step[`${key}${currentLang === "en" ? "En" : "Ko"}`]; }

  function seededTarget(stageIndex, total) {
    if (stageIndex === 0) return total - 1; // 안내형 첫 판: 오른쪽 아래
    const seed = ((Date.now() / 86400000) | 0) + stageIndex * 17 + state.foundCount * 7;
    return Math.abs((seed * 9301 + 49297) % 233280) % total;
  }

  function showScreen(name) {
    state.screen = name;
    $("#homeScreen").classList.toggle("active", name === "home");
    $("#gameScreen").classList.toggle("active", name === "game");
    document.body.classList.toggle("in-game", name === "game");
    requestAnimationFrame(() => {
      $("#main").focus();
      notifyResize();
    });
  }

  function startGame({ guided = false, resetAll = true } = {}) {
    if (resetAll) {
      state.stageIndex = 0;
      state.foundCount = 0;
    }
    state.wrongAttempts = 0;
    state.stageComplete = false;
    const stage = STAGES[state.stageIndex];
    state.targetIndex = guided || state.stageIndex === 0 ? stage.cols * stage.rows - 1 : seededTarget(state.stageIndex, stage.cols * stage.rows);
    state.cursorIndex = 0;
    showScreen("game");
    renderStage();
    const text = stageText(stage);
    const intro = currentLang === "en"
      ? `${text[1]}. ${text[2]} One center dot is ordinary. Five dots in a cross are the hidden light.`
      : `${text[1]}입니다. ${text[2]} 가운데 한 점은 보통 돌이고, 십자 모양 다섯 점은 숨은 빛이에요.`;
    setStatus(intro);
    speak(intro);
  }

  function setStatus(message, type = "") {
    const el = $("#statusMessage");
    el.textContent = message;
    el.className = `status-message${type ? ` ${type}` : ""}`;
    live(message);
  }

  function renderProgress() {
    const wrap = $("#progressStars");
    wrap.innerHTML = "";
    for (let i = 0; i < STAGES.length; i++) {
      const span = document.createElement("span");
      span.className = `progress-star${i < state.foundCount ? " on" : ""}`;
      span.textContent = "★";
      span.setAttribute("aria-hidden", "true");
      wrap.appendChild(span);
    }
    wrap.setAttribute("aria-label", currentLang === "en" ? `${state.foundCount} of 5 lights collected` : `빛 ${state.foundCount}개 모음`);
    $("#progressMeter").style.width = `${Math.max(4, state.foundCount / STAGES.length * 100)}%`;
  }

  function renderStage() {
    const stage = STAGES[state.stageIndex];
    const text = stageText(stage);
    $("#stageKicker").textContent = text[0];
    $("#stageTitle").textContent = text[1];
    $("#stageDesc").textContent = text[2];
    // Use a real <img> for the full-scene background so the path resolves
    // against the document (not styles/game.css). Keep the CSS var in sync for
    // any legacy styling that still references it.
    $("#stageArt").src = stage.art;
    $("#boardShell").style.setProperty("--stage-art", `url(\"${stage.art}\")`);
    $("#instruction").textContent = currentLang === "en"
      ? "An ordinary stone has one center dot. The hidden light has five dots in a cross."
      : "보통 돌은 가운데 점 하나, 숨은 빛은 십자 모양 다섯 점입니다.";
    renderProgress();
    renderBoard();
    renderTechnicalPreview();
    sendFrame();
  }

  function spotPattern(isTarget) {
    if (!isTarget) return `<span class="pin c"></span>`;
    return `<span class="pin c"></span><span class="pin n"></span><span class="pin s"></span><span class="pin w"></span><span class="pin e"></span>`;
  }

  function renderBoard() {
    const stage = STAGES[state.stageIndex];
    const board = $("#searchBoard");
    board.style.gridTemplateColumns = `repeat(${stage.cols}, auto)`;
    board.style.gridTemplateRows = `repeat(${stage.rows}, auto)`;
    board.innerHTML = "";
    const total = stage.cols * stage.rows;
    for (let index = 0; index < total; index++) {
      const row = Math.floor(index / stage.cols);
      const col = index % stage.cols;
      const isTarget = index === state.targetIndex;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `spot${index === state.cursorIndex ? " selected" : ""}${state.stageComplete && isTarget ? " found" : ""}`;
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-selected", String(index === state.cursorIndex));
      button.setAttribute("aria-label", currentLang === "en" ? `Row ${row + 1}, column ${col + 1}` : `${row + 1}행 ${col + 1}열`);
      button.dataset.index = String(index);
      button.innerHTML = `<span class="pin-pattern${isTarget ? " target-pattern" : ""}" aria-hidden="true">${spotPattern(isTarget)}</span>`;
      button.addEventListener("click", () => {
        state.cursorIndex = index;
        renderBoard(); renderTechnicalPreview(); sendFrame();
        readCurrent(false);
      });
      button.addEventListener("dblclick", checkCurrent);
      board.appendChild(button);
    }
  }

  function moveCursor(dx, dy) {
    if (state.screen !== "game" || state.stageComplete) return;
    const stage = STAGES[state.stageIndex];
    let row = Math.floor(state.cursorIndex / stage.cols);
    let col = state.cursorIndex % stage.cols;
    row = Math.max(0, Math.min(stage.rows - 1, row + dy));
    col = Math.max(0, Math.min(stage.cols - 1, col + dx));
    const next = row * stage.cols + col;
    if (next === state.cursorIndex) {
      tone("miss");
      speak(currentLang === "en" ? "That is the edge of the board." : "보드의 끝이에요.");
      return;
    }
    state.cursorIndex = next;
    tone("move");
    renderBoard(); renderTechnicalPreview(); sendFrame();
    readCurrent(false);
  }

  function coordinates(index) {
    const stage = STAGES[state.stageIndex];
    return { row: Math.floor(index / stage.cols), col: index % stage.cols };
  }

  function readCurrent(voice = true) {
    const { row, col } = coordinates(state.cursorIndex);
    const message = COPY.current(row + 1, col + 1);
    setStatus(message);
    if (voice) speak(message);
  }

  function directionHint() {
    const cur = coordinates(state.cursorIndex);
    const target = coordinates(state.targetIndex);
    const vertical = target.row < cur.row ? (currentLang === "en" ? "up" : "위") : target.row > cur.row ? (currentLang === "en" ? "down" : "아래") : "";
    const horizontal = target.col < cur.col ? (currentLang === "en" ? "left" : "왼쪽") : target.col > cur.col ? (currentLang === "en" ? "right" : "오른쪽") : "";
    if (!vertical && !horizontal) return currentLang === "en" ? "The light is at the selected spot." : "빛은 지금 선택한 자리에 있어요.";
    if (currentLang === "en") return `The light is ${[vertical, horizontal].filter(Boolean).join(" and ")} of the selected spot.`;
    return `빛은 지금 선택한 자리보다 ${[vertical, horizontal].filter(Boolean).join("쪽 ")}쪽에 있어요.`;
  }

  function exactHint() {
    const target = coordinates(state.targetIndex);
    return currentLang === "en" ? `It is in row ${target.row + 1}, column ${target.col + 1}.` : `${target.row + 1}행 ${target.col + 1}열에 있어요.`;
  }

  function giveHint(manual = true) {
    if (state.screen !== "game" || state.stageComplete) return;
    let message;
    if (state.stageIndex === 0 || state.wrongAttempts >= 2 || manual && state.wrongAttempts >= 1) message = exactHint();
    else message = directionHint();
    tone("hint");
    setStatus(message);
    speak(message);
  }

  async function checkCurrent() {
    if (state.screen !== "game" || state.stageComplete) return;
    if (state.cursorIndex === state.targetIndex) {
      state.stageComplete = true;
      state.foundCount += 1;
      tone("found");
      renderProgress(); renderBoard(); renderTechnicalPreview();
      await celebrationPulse();
      const stage = STAGES[state.stageIndex];
      const text = stageText(stage);
      const message = `${COPY.found} ${storyText(stage)}`;
      setStatus(message, "success");
      speak(message, { assertive: true });
      setTimeout(() => openStageDialog(), 650);
      return;
    }
    state.wrongAttempts += 1;
    tone("miss");
    const message = `${COPY.miss} ${state.wrongAttempts >= 2 ? exactHint() : directionHint()}`;
    setStatus(message, "error");
    speak(message);
  }

  function readOverview() {
    if (state.screen !== "game") return;
    const stage = STAGES[state.stageIndex];
    const text = stageText(stage);
    const message = COPY.overview(text[1], stage.rows, stage.cols, state.foundCount);
    setStatus(message);
    speak(message);
  }

  function restartStage() {
    if (state.screen !== "game") return;
    state.wrongAttempts = 0;
    state.stageComplete = false;
    const stage = STAGES[state.stageIndex];
    state.targetIndex = state.stageIndex === 0 ? stage.cols * stage.rows - 1 : seededTarget(state.stageIndex, stage.cols * stage.rows);
    state.cursorIndex = 0;
    renderStage();
    const message = currentLang === "en" ? "This stage has restarted. Explore from the first stone." : "이 단계를 다시 시작했어요. 첫 번째 돌부터 천천히 찾아보세요.";
    setStatus(message); speak(message);
  }

  function openStageDialog() {
    const stage = STAGES[state.stageIndex];
    const text = stageText(stage);
    $("#stageDialogKicker").textContent = currentLang === "en" ? "Light found" : "빛 점을 찾았어요";
    $("#stageDialogTitle").textContent = currentLang === "en" ? `${text[1]} is glowing!` : `${text[1]}이 환해졌어요!`;
    $("#stageDialogDesc").textContent = storyText(stage);
    $("#nextStageBtn").textContent = state.stageIndex === STAGES.length - 1 ? (currentLang === "en" ? "Wake the tree" : "별빛 나무 깨우기") : COPY.next;
    $("#stageDialog").showModal();
    $("#nextStageBtn").focus();
  }

  function nextStage() {
    $("#stageDialog").close();
    if (state.stageIndex >= STAGES.length - 1) {
      openCompleteDialog();
      return;
    }
    state.stageIndex += 1;
    state.wrongAttempts = 0;
    state.stageComplete = false;
    const stage = STAGES[state.stageIndex];
    state.targetIndex = seededTarget(state.stageIndex, stage.cols * stage.rows);
    state.cursorIndex = 0;
    renderStage();
    requestAnimationFrame(() => document.querySelector(".spot.selected")?.focus());
    const text = stageText(stage);
    const message = `${text[1]}. ${text[2]}`;
    setStatus(message); speak(message);
  }

  function openCompleteDialog() {
    $("#completeDialog").showModal();
    $("#playAgainBtn").focus();
    speak(COPY.finish, { assertive: true });
    postHost("game-complete", { gameId: "hidden-dot", score: state.foundCount, maxScore: STAGES.length });
  }

  function goHome() {
    [$("#stageDialog"), $("#completeDialog"), $("#tutorialDialog")].forEach(dialog => { if (dialog.open) dialog.close(); });
    showScreen("home");
    if (state.connected && state.sdk) {
      try { state.sdk.displayAllDown(); } catch (_) {}
    }
    speak(currentLang === "en" ? "Back at the game introduction." : "게임 소개 화면으로 돌아왔어요.");
  }

  function openTutorial() {
    state.tutorialIndex = 0;
    renderTutorial();
    $("#tutorialDialog").showModal();
    $("#tutorialNextBtn").focus();
    speak(tutorialText(TUTORIAL[0], "audio"));
  }

  function renderTutorial() {
    const step = TUTORIAL[state.tutorialIndex];
    $("#tutorialStep").textContent = currentLang === "en" ? `Tutorial ${state.tutorialIndex + 1} / 7` : `튜토리얼 ${state.tutorialIndex + 1} / 7`;
    $("#tutorialTitle").textContent = tutorialText(step, "title");
    $("#tutorialDesc").textContent = tutorialText(step, "desc");
    $("#tutorialVisual").textContent = tutorialText(step, "visual");
    $("#tutorialTactile").textContent = tutorialText(step, "tactile");
    $("#tutorialAudio").textContent = tutorialText(step, "audio");
    $("#tutorialPrevBtn").disabled = state.tutorialIndex === 0;
    $("#tutorialNextBtn").textContent = state.tutorialIndex === TUTORIAL.length - 1 ? (currentLang === "en" ? "Start guided game" : "안내와 함께 시작") : (currentLang === "en" ? "Next" : "다음");
    const dots = $("#tutorialDots"); dots.innerHTML = "";
    TUTORIAL.forEach((_, i) => { const d = document.createElement("span"); d.className = `tutorial-dot${i === state.tutorialIndex ? " on" : ""}`; dots.appendChild(d); });
  }

  function tutorialNext() {
    if (state.tutorialIndex < TUTORIAL.length - 1) {
      state.tutorialIndex += 1; renderTutorial(); speak(tutorialText(TUTORIAL[state.tutorialIndex], "audio"));
    } else {
      $("#tutorialDialog").close(); startGame({ guided: true, resetAll: true });
    }
  }

  function tutorialPrev() {
    if (state.tutorialIndex > 0) { state.tutorialIndex -= 1; renderTutorial(); speak(tutorialText(TUTORIAL[state.tutorialIndex], "audio")); }
  }

  // ---- On-demand help drawer + tactile overlay -----------------------------
  const HELP_ROWS = [
    { ko: ["위치 이동", "← ↑ ↓ →", "Pan L/R · F1 · F2"], en: ["Move selection", "← ↑ ↓ →", "Pan L/R · F1 · F2"] },
    { ko: ["위치 확인", "Enter", "F3"], en: ["Check position", "Enter", "F3"] },
    { ko: ["현재 위치 듣기", "Space", "F4"], en: ["Hear position", "Space", "F4"] },
    { ko: ["전체 상황 듣기", "—", "Pan All"], en: ["Hear overview", "—", "Pan All"] },
    { ko: ["힌트", "H", "—"], en: ["Hint", "H", "—"] },
    { ko: ["단계 다시 시작", "R", "LPF1"], en: ["Restart stage", "R", "LPF1"] }
  ];

  function renderHelp() {
    const body = $("#helpTableBody");
    body.innerHTML = "";
    for (const row of HELP_ROWS) {
      const cells = currentLang === "en" ? row.en : row.ko;
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.scope = "row";
      th.textContent = cells[0];
      tr.appendChild(th);
      for (let i = 1; i < cells.length; i++) {
        const td = document.createElement("td");
        td.innerHTML = cells[i] === "—" ? "<span class=\"help-none\">—</span>" : `<kbd>${cells[i]}</kbd>`;
        tr.appendChild(td);
      }
      body.appendChild(tr);
    }
  }

  function openHelp() {
    renderHelp();
    $("#helpDialog").showModal();
    $("#closeHelpBtn").focus();
  }

  function openTactile() {
    if (previewOff) return; // host requested no on-screen tactile preview
    renderTechnicalPreview();
    $("#tactileDialog").showModal();
    $("#closeTactileBtn").focus();
  }

  // ---- 60×40 tactile frame (reusable module) -------------------------------
  function buildFrame(showCursor = true) {
    return buildHiddenDotFrame({
      screen: state.screen,
      stage: STAGES[state.stageIndex],
      targetIndex: state.targetIndex,
      cursorIndex: state.cursorIndex,
      blinkOn: state.blinkOn,
      stageComplete: state.stageComplete,
      showCursor
    });
  }

  function renderTechnicalPreview() {
    const canvas = $("#dotpadCanvas");
    const ctx = canvas.getContext("2d");
    const matrix = buildFrame(true);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#020914"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cellW = canvas.width / 60, cellH = canvas.height / 40;
    for (let y = 0; y < 40; y++) {
      for (let x = 0; x < 60; x++) {
        ctx.beginPath();
        ctx.arc((x + .5) * cellW, (y + .5) * cellH, Math.max(1.4, Math.min(cellW, cellH) * .34), 0, Math.PI * 2);
        ctx.fillStyle = matrix[y][x] ? "#fff0a8" : "#1b3b5b";
        ctx.shadowColor = matrix[y][x] ? "rgba(255, 215, 93, .85)" : "transparent";
        ctx.shadowBlur = matrix[y][x] ? 5 : 0;
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    const hex = matrixToHex(matrix);
    $("#hexMeta").textContent = `${hex.length / 2} bytes · ${hex.length} hex`;
    window.__latestDotpadHex = hex;
  }

  async function sendFrame(force = false) {
    const hex = matrixToHex(buildFrame(true));
    window.__latestDotpadHex = hex;
    if (!state.connected || !state.sdk || (!force && state.sentHex === hex)) return;
    state.sentHex = hex;
    try {
      await state.sdk.displayGraphicData(hex);
      $("#padStatus").textContent = currentLang === "en" ? "Sent to DotPad" : "닷패드 전송됨";
    } catch (error) {
      console.warn("[DotPad send]", error);
      $("#padStatus").textContent = currentLang === "en" ? "Send failed" : "전송 실패";
    }
  }

  async function celebrationPulse() {
    if (!state.connected || !state.sdk) return;
    try {
      for (let i = 0; i < 2; i++) {
        if (state.sdk.displayAllUp) state.sdk.displayAllUp();
        await new Promise(r => setTimeout(r, 85));
        if (state.sdk.displayAllDown) state.sdk.displayAllDown();
        await new Promise(r => setTimeout(r, 65));
      }
      await sendFrame(true);
    } catch (_) {}
  }

  window.getDotpadFrame = () => matrixToHex(buildFrame(true));
  window.__DOT_GAME_METADATA__ = Object.freeze({
    id: "hidden-dot",
    title: { ko: "숨은 점 찾기", en: "Find the Hidden Dot" },
    genre: "tactile-search",
    difficulty: 1,
    durationMinutes: 3,
    resolutions: ["60x40"],
    embed: true,
    tts: "TW_TTS",
    controls: { keyboard: ["Arrow keys", "Enter", "Space"], dotpad: ["F1", "F2", "F3", "F4", "PanningLeft", "PanningRight", "PanningAll"] }
  });

  // ---- DotPad SDK 3.0 adapter ---------------------------------------------
  async function loadSDK() {
    if (state.sdk) return true;
    try {
      const mod = await import("../dotpad-sdk/DotPadSDK-3.0.0.js");
      state.keyCodes = mod.KeyCodes;
      state.dataCodes = mod.DataCodes;
      state.sdk = new mod.DotPadSDK();
      state.scanner = new mod.DotPadScanner();
      state.sdk.setCallBack(
        (device, code) => {
          if (code === state.dataCodes.Connected) {
            state.connected = true;
            updateConnectionUI();
            try { state.sdk.displayAllDown(); } catch (_) {}
            setTimeout(() => sendFrame(true), 240);
            speak(currentLang === "en" ? "DotPad connected. The current tactile board is displayed." : "닷패드가 연결됐어요. 현재 촉각 보드를 출력했어요.");
          } else if (code === state.dataCodes.Disconnected) {
            state.connected = false;
            updateConnectionUI();
            speak(currentLang === "en" ? "DotPad disconnected." : "닷패드 연결이 끊어졌어요.");
          }
        },
        (device, keyCode) => handleDotPadKey(keyCode)
      );
      return true;
    } catch (error) {
      console.warn("[DotPad SDK]", error);
      $("#padStatus").textContent = currentLang === "en" ? "SDK not found" : "SDK 없음 · 시뮬레이터";
      return false;
    }
  }

  async function connectDotPad() {
    if (state.connected) {
      try { state.sdk?.disconnect(); } catch (_) {}
      state.connected = false; updateConnectionUI();
      return;
    }
    if (!navigator.bluetooth || !window.isSecureContext) {
      setStatus(COPY.connectionFail, "error"); speak(COPY.connectionFail); return;
    }
    const loaded = await loadSDK();
    if (!loaded) { setStatus(COPY.sdkMissing, "error"); speak(COPY.sdkMissing); return; }
    setStatus(COPY.connectionWait); speak(COPY.connectionWait);
    try {
      let device = null;
      try {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ namePrefix: "DotPad" }, { namePrefix: "KM2-" }, { namePrefix: "KM3-" }, { namePrefix: "DPK" }, { namePrefix: "DMI" }],
          optionalServices: [state.scanner.DOTPAD_SERVICE]
        });
      } catch (error) {
        if (error.name === "NotFoundError") return;
        throw error;
      }
      if (device) await state.sdk.connectBleDevice(device);
    } catch (error) {
      console.error("[DotPad connect]", error);
      setStatus(COPY.connectionFail, "error"); speak(COPY.connectionFail);
    }
  }

  function updateConnectionUI() {
    const button = $("#connectBtn");
    button.classList.toggle("connected", state.connected);
    button.innerHTML = `<span class="connection-dot" aria-hidden="true"></span><span class="label">${state.connected ? COPY.connected : COPY.connect}</span>`;
    button.setAttribute("aria-pressed", String(state.connected));
    $("#padStatus").textContent = state.connected ? COPY.connected : (currentLang === "en" ? "Simulator" : "시뮬레이터");
  }

  function handleDotPadKey(keyCode) {
    const K = state.keyCodes;
    if (!K) return;
    switch (keyCode) {
      case K.PanningLeft: moveCursor(-1, 0); break;
      case K.PanningRight: moveCursor(1, 0); break;
      case K.KeyFunction1: moveCursor(0, -1); break;
      case K.KeyFunction2: moveCursor(0, 1); break;
      case K.KeyFunction3: checkCurrent(); break;
      case K.KeyFunction4: readCurrent(true); break;
      case K.PanningAll: readOverview(); break;
      case K.LPF1: restartStage(); break;
    }
  }

  function handleKeyboard(event) {
    if (state.screen !== "game" || $("#tutorialDialog").open || $("#stageDialog").open || $("#completeDialog").open || $("#helpDialog").open || $("#tactileDialog").open) return;
    // Let Enter/Space activate a focused HUD/action control normally instead of
    // being captured as check/read. The play surface (#main and the .spot cells)
    // is excluded, so arrow/Enter/Space/F-key play controls are unchanged.
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("button:not(.spot), a[href], [role='button']:not(.spot)")) return;
    }
    let handled = true;
    switch (event.key) {
      case "ArrowLeft": moveCursor(-1, 0); break;
      case "ArrowRight": moveCursor(1, 0); break;
      case "ArrowUp": moveCursor(0, -1); break;
      case "ArrowDown": moveCursor(0, 1); break;
      case "Enter": checkCurrent(); break;
      case " ": readCurrent(true); break;
      case "F1": moveCursor(0, -1); break;
      case "F2": moveCursor(0, 1); break;
      case "F3": checkCurrent(); break;
      case "F4": readCurrent(true); break;
      case "h": case "H": giveHint(true); break;
      case "r": case "R": restartStage(); break;
      default: handled = false;
    }
    if (handled) event.preventDefault();
  }

  function postHost(type, payload = {}) { hostBridge.post(type, payload); }

  function notifyResize() {
    postHost("resize", { height: Math.ceil(document.documentElement.scrollHeight) });
  }

  function exitGame() {
    if (embedded) postHost("exit");
    else goHome();
  }

  // ---- UI bindings ----------------------------------------------------------
  $("#tutorialBtn").addEventListener("click", openTutorial);
  $("#quickStartBtn").addEventListener("click", () => startGame({ guided: false, resetAll: true }));
  $("#soundBtn").addEventListener("click", () => setSound(!state.soundOn));
  $("#connectBtn").addEventListener("click", connectDotPad);
  $("#exitBtn").addEventListener("click", exitGame);
  $("#checkBtn").addEventListener("click", checkCurrent);
  $("#readBtn").addEventListener("click", () => readCurrent(true));
  $("#hintBtn").addEventListener("click", () => giveHint(true));
  $("#restartBtn").addEventListener("click", restartStage);
  $("#helpBtn").addEventListener("click", openHelp);
  $("#closeHelpBtn").addEventListener("click", () => $("#helpDialog").close());
  $("#tactileBtn").addEventListener("click", openTactile);
  $("#closeTactileBtn").addEventListener("click", () => $("#tactileDialog").close());
  $("#tutorialNextBtn").addEventListener("click", tutorialNext);
  $("#tutorialPrevBtn").addEventListener("click", tutorialPrev);
  $("#tutorialReplayBtn").addEventListener("click", () => speak(tutorialText(TUTORIAL[state.tutorialIndex], "audio")));
  $("#closeTutorialBtn").addEventListener("click", () => $("#tutorialDialog").close());
  $("#nextStageBtn").addEventListener("click", nextStage);
  $("#stageHomeBtn").addEventListener("click", goHome);
  $("#completeHomeBtn").addEventListener("click", goHome);
  $("#playAgainBtn").addEventListener("click", () => { $("#completeDialog").close(); startGame({ guided: false, resetAll: true }); });
  document.addEventListener("keydown", handleKeyboard);
  document.addEventListener("visibilitychange", () => { if (document.hidden && window.TW_TTS) window.TW_TTS.stop(); });
  window.addEventListener("beforeunload", () => { tts.stop(); hostBridge.destroy(); });
  hostBridge.subscribe((data) => {
    if (data.type === "set-lang" && (data.lang === "ko" || data.lang === "en") && data.lang !== currentLang) location.search = new URLSearchParams({ ...Object.fromEntries(params), lang: data.lang }).toString();
    if (data.type === "pause" && window.TW_TTS) window.TW_TTS.stop();
    if (data.type === "exit") goHome();
  });
  if (window.ResizeObserver) new ResizeObserver(() => notifyResize()).observe(document.body);

  // blink only the selection frame, not the target pattern.
  setInterval(() => {
    if (state.screen !== "game" || state.stageComplete) return;
    state.blinkOn = !state.blinkOn;
    renderTechnicalPreview(); sendFrame();
  }, 800);

  // Localized minimal UI strings controlled by host query language.
  if (currentLang === "en") {
    $("#brandTitle").textContent = "Find the Hidden Dot";
    $("#homeEyebrow").textContent = "A tactile search game for children";
    $("#homeTitle").innerHTML = "Find the<br>Hidden Dot";
    $("#homeLead").textContent = "Find the different light dot by touch and wake the sleeping starlight tree.";
    $("#homeStory").textContent = "A night wind hid five lights from the starlight tree among the forest stones. Explore the dots slowly with Dotty, then confirm the special light pattern.";
    $("#tutorialBtn").textContent = "Learn from the beginning";
    $("#quickStartBtn").textContent = "Quick start";
    $("#boardHelp").textContent = "Move with the arrow keys and press Enter to check. Press Space to hear the current position.";
    $("#checkBtn .gb-text").textContent = "Check spot";
    $("#readBtn .gb-text").textContent = "Position";
    $("#hintBtn .gb-text").textContent = "Hint";
    $("#restartBtn .gb-text").textContent = "Restart";
    $("#helpBtn .icon-btn-label").textContent = "Controls";
    $("#helpBtn").setAttribute("aria-label", "Controls");
    $("#tactileBtn .icon-btn-label").textContent = "Tactile";
    $("#tactileBtn").setAttribute("aria-label", "Tactile preview");
    $("#helpKicker").textContent = "Help";
    $("#helpTitle").textContent = "How to play";
    $("#helpLead").textContent = "Arrow keys and function keys mirror the tactile search exactly.";
    $("#helpColAction").textContent = "Action";
    $("#helpColKeyboard").textContent = "Keyboard";
    $("#helpColDotpad").textContent = "DotPad";
    $("#helpNote").textContent = "You can finish the whole game with the screen and voice alone, even without a DotPad.";
    $("#closeHelpBtn").setAttribute("aria-label", "Close controls");
    $("#tactileKicker").textContent = "60 × 40 tactile output";
    $("#tactileTitle").textContent = "Tactile preview";
    $("#tactileDesc").textContent = "This is the 60 × 40 dot pattern sent to the DotPad. Bright dots are raised pins.";
    $("#closeTactileBtn").setAttribute("aria-label", "Close tactile preview");
  }

  updateConnectionUI();
  setSound(true, false);
  loadSDK(); // silent preload; simulator remains available if missing.
  renderTechnicalPreview();
  postHost("ready", { version: "1.0.0", resolution: "60x40", tts: "TW_TTS" });
  notifyResize();
})();
