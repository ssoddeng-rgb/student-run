// BootScene.js - 부트 씬
// 픽셀아트 스타일로 모든 텍스처를 프로그래밍 방식으로 생성

var BootScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function BootScene() {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },

    create: function () {
        var g = this.make.graphics({ x: 0, y: 0, add: false });

        // 픽셀 단위로 그리는 헬퍼 함수
        // pixels: [{x, y, c}] 배열, pw: 픽셀 1칸 실제 크기(px)
        function drawPixels(g, pixels, pw) {
            pixels.forEach(function (p) {
                g.fillStyle(p.c);
                g.fillRect(p.x * pw, p.y * pw, pw, pw);
            });
        }

        // ── 색상 상수 ──────────────────────────────────────────────────
        var SKIN   = 0xFFCC99;
        var HAIR   = 0x4A3000;
        var NAVY   = 0x1A3A6B;
        var NAVYL  = 0x2A5499; // 밝은 네이비 (하이라이트)
        var PANTS  = 0x1A1A4A;
        var PANTSL = 0x2A2A6A;
        var SHOE   = 0x333333;
        var SHOEL  = 0x555555;
        var WHITE  = 0xFFFFFF;
        var BELT   = 0x8B4513;
        var EYE    = 0x1A0A00;
        var MOUTH  = 0xCC6655;
        var SOCK   = 0xEEEEEE;

        // ================================================================
        // 학생 스프라이트 (32×48 텍스처, pw=2 → 16×24 그리드)
        // ================================================================
        var pw = 2;

        // 공통 학생 픽셀 (머리~몸통~팔)
        var studentBase = [
            // ── 머리카락 (row 2-3, cols 5-10) ──
            {x:5,y:2,c:HAIR},{x:6,y:2,c:HAIR},{x:7,y:2,c:HAIR},{x:8,y:2,c:HAIR},{x:9,y:2,c:HAIR},{x:10,y:2,c:HAIR},
            {x:5,y:3,c:HAIR},{x:6,y:3,c:HAIR},{x:7,y:3,c:HAIR},{x:8,y:3,c:HAIR},{x:9,y:3,c:HAIR},{x:10,y:3,c:HAIR},
            {x:4,y:3,c:HAIR},{x:11,y:3,c:HAIR},
            // ── 얼굴 (row 3-6, cols 5-10) ──
            {x:5,y:4,c:SKIN},{x:6,y:4,c:SKIN},{x:7,y:4,c:SKIN},{x:8,y:4,c:SKIN},{x:9,y:4,c:SKIN},{x:10,y:4,c:SKIN},
            {x:4,y:4,c:HAIR},{x:11,y:4,c:HAIR},
            {x:4,y:5,c:SKIN},{x:5,y:5,c:SKIN},{x:6,y:5,c:SKIN},{x:7,y:5,c:SKIN},{x:8,y:5,c:SKIN},{x:9,y:5,c:SKIN},{x:10,y:5,c:SKIN},{x:11,y:5,c:SKIN},
            {x:4,y:6,c:SKIN},{x:5,y:6,c:SKIN},{x:6,y:6,c:SKIN},{x:7,y:6,c:SKIN},{x:8,y:6,c:SKIN},{x:9,y:6,c:SKIN},{x:10,y:6,c:SKIN},{x:11,y:6,c:SKIN},
            // 눈 (row 4-5)
            {x:6,y:4,c:EYE},{x:7,y:4,c:EYE},
            {x:9,y:4,c:EYE},{x:10,y:4,c:EYE},
            // 입 (row 6)
            {x:7,y:6,c:MOUTH},{x:8,y:6,c:MOUTH},{x:9,y:6,c:MOUTH},
            // ── 목 (row 7) ──
            {x:7,y:7,c:SKIN},{x:8,y:7,c:SKIN},
            // ── 교복 몸통 (row 7-13, cols 4-11) ──
            {x:4,y:7,c:NAVY},{x:5,y:7,c:NAVY},{x:6,y:7,c:NAVY},{x:9,y:7,c:NAVY},{x:10,y:7,c:NAVY},{x:11,y:7,c:NAVY},
            {x:4,y:8,c:NAVY},{x:5,y:8,c:NAVY},{x:6,y:8,c:NAVYL},{x:7,y:8,c:NAVY},{x:8,y:8,c:NAVY},{x:9,y:8,c:NAVYL},{x:10,y:8,c:NAVY},{x:11,y:8,c:NAVY},
            {x:4,y:9,c:NAVY},{x:5,y:9,c:NAVY},{x:6,y:9,c:NAVY},{x:7,y:9,c:WHITE},{x:8,y:9,c:WHITE},{x:9,y:9,c:NAVY},{x:10,y:9,c:NAVY},{x:11,y:9,c:NAVY},
            {x:4,y:10,c:NAVY},{x:5,y:10,c:NAVY},{x:6,y:10,c:NAVY},{x:7,y:10,c:NAVY},{x:8,y:10,c:NAVY},{x:9,y:10,c:NAVY},{x:10,y:10,c:NAVY},{x:11,y:10,c:NAVY},
            {x:4,y:11,c:NAVY},{x:5,y:11,c:NAVY},{x:6,y:11,c:NAVY},{x:7,y:11,c:NAVY},{x:8,y:11,c:NAVY},{x:9,y:11,c:NAVY},{x:10,y:11,c:NAVY},{x:11,y:11,c:NAVY},
            {x:4,y:12,c:NAVY},{x:5,y:12,c:NAVY},{x:6,y:12,c:NAVY},{x:7,y:12,c:NAVY},{x:8,y:12,c:NAVY},{x:9,y:12,c:NAVY},{x:10,y:12,c:NAVY},{x:11,y:12,c:NAVY},
            // 벨트 (row 13)
            {x:4,y:13,c:BELT},{x:5,y:13,c:BELT},{x:6,y:13,c:BELT},{x:7,y:13,c:BELT},{x:8,y:13,c:BELT},{x:9,y:13,c:BELT},{x:10,y:13,c:BELT},{x:11,y:13,c:BELT},
            // ── 팔 (body 옆) ──
            // 왼팔 (cols 2-3, rows 8-12)
            {x:2,y:8,c:NAVY},{x:3,y:8,c:NAVY},
            {x:2,y:9,c:NAVY},{x:3,y:9,c:NAVY},
            {x:2,y:10,c:NAVY},{x:3,y:10,c:NAVY},
            {x:2,y:11,c:SKIN},{x:3,y:11,c:SKIN},
            {x:2,y:12,c:SKIN},{x:3,y:12,c:SKIN},
            // 오른팔 (cols 12-13, rows 8-12)
            {x:12,y:8,c:NAVY},{x:13,y:8,c:NAVY},
            {x:12,y:9,c:NAVY},{x:13,y:9,c:NAVY},
            {x:12,y:10,c:NAVY},{x:13,y:10,c:NAVY},
            {x:12,y:11,c:SKIN},{x:13,y:11,c:SKIN},
            {x:12,y:12,c:SKIN},{x:13,y:12,c:SKIN},
            // ── 가방 힌트 (오른쪽 등 뒤) ──
            {x:12,y:8,c:0xCC3333},{x:13,y:8,c:0xCC3333},
            {x:12,y:9,c:0xCC3333},{x:13,y:9,c:0xCC3333},
            {x:12,y:10,c:0xAA2222},{x:13,y:10,c:0xAA2222}
        ];

        // 달리기 자세 다리 (row 14-20: 왼발 앞, 오른발 뒤)
        var runLegs = [
            // 왼쪽 다리 (앞)
            {x:5,y:14,c:PANTS},{x:6,y:14,c:PANTS},
            {x:5,y:15,c:PANTS},{x:6,y:15,c:PANTS},
            {x:5,y:16,c:PANTS},{x:6,y:16,c:PANTS},
            {x:5,y:17,c:PANTSL},{x:6,y:17,c:PANTS},
            {x:4,y:18,c:PANTS},{x:5,y:18,c:PANTS},
            {x:4,y:19,c:PANTS},{x:5,y:19,c:PANTS},
            // 오른쪽 다리 (뒤)
            {x:9,y:14,c:PANTS},{x:10,y:14,c:PANTS},
            {x:9,y:15,c:PANTS},{x:10,y:15,c:PANTS},
            {x:9,y:16,c:PANTS},{x:10,y:16,c:PANTS},
            {x:10,y:17,c:PANTS},{x:11,y:17,c:PANTSL},
            {x:10,y:18,c:PANTS},{x:11,y:18,c:PANTS},
            {x:10,y:19,c:PANTS},{x:11,y:19,c:PANTS},
            // 양말
            {x:4,y:20,c:SOCK},{x:5,y:20,c:SOCK},
            {x:10,y:20,c:SOCK},{x:11,y:20,c:SOCK},
            // 신발 (row 21-23)
            {x:3,y:21,c:SHOE},{x:4,y:21,c:SHOE},{x:5,y:21,c:SHOEL},{x:6,y:21,c:SHOE},
            {x:3,y:22,c:SHOE},{x:4,y:22,c:SHOE},{x:5,y:22,c:SHOE},{x:6,y:22,c:SHOE},
            {x:9,y:21,c:SHOE},{x:10,y:21,c:SHOE},{x:11,y:21,c:SHOEL},{x:12,y:21,c:SHOE},
            {x:9,y:22,c:SHOE},{x:10,y:22,c:SHOE},{x:11,y:22,c:SHOE},{x:12,y:22,c:SHOE}
        ];

        // 점프 자세 다리 (다리를 구부려서 위로 올림)
        var jumpLegs = [
            // 왼쪽 다리 (접힌 모습)
            {x:5,y:14,c:PANTS},{x:6,y:14,c:PANTS},
            {x:5,y:15,c:PANTS},{x:6,y:15,c:PANTS},
            {x:4,y:15,c:PANTS},{x:7,y:15,c:PANTS},
            {x:4,y:16,c:PANTS},{x:5,y:16,c:PANTS},
            // 오른쪽 다리 (접힌 모습)
            {x:9,y:14,c:PANTS},{x:10,y:14,c:PANTS},
            {x:9,y:15,c:PANTS},{x:10,y:15,c:PANTS},
            {x:9,y:16,c:PANTS},{x:11,y:16,c:PANTS},
            {x:10,y:16,c:PANTS},{x:11,y:16,c:PANTS},
            // 신발 (올라간 위치)
            {x:3,y:16,c:SHOE},{x:4,y:17,c:SHOE},{x:5,y:17,c:SHOEL},
            {x:10,y:17,c:SHOE},{x:11,y:17,c:SHOE},{x:12,y:16,c:SHOE}
        ];

        // student 텍스처 생성 (달리기)
        g.clear();
        drawPixels(g, studentBase, pw);
        drawPixels(g, runLegs, pw);
        g.generateTexture('student', 32, 48);

        // student_jump 텍스처 생성 (점프)
        g.clear();
        drawPixels(g, studentBase, pw);
        drawPixels(g, jumpLegs, pw);
        g.generateTexture('student_jump', 32, 48);

        // ================================================================
        // 지면 (800×16 텍스처)
        // ================================================================
        g.clear();
        // Row 0-3: 짙은 초록 (잔디)
        g.fillStyle(0x3A7A3A);
        g.fillRect(0, 0, 800, 8);
        // Row 4-7: 밝은 초록
        g.fillStyle(0x4A9A4A);
        g.fillRect(0, 8, 800, 8);
        // Row 8-11: 흙 갈색
        g.fillStyle(0x8B6914);
        g.fillRect(0, 16, 800, 8); // 실제 16px 텍스처에서는 생략
        // Row 12-15: 어두운 흙
        g.fillStyle(0x6B4F10);
        g.fillRect(0, 24, 800, 8);

        // 풀 타래 (16px 간격마다)
        g.fillStyle(0x2A6A2A);
        for (var tx = 0; tx < 800; tx += 16) {
            // 풀 픽셀 타래 (2px 단위)
            g.fillRect(tx,     0, 2, 4);
            g.fillRect(tx + 4, 0, 2, 6);
            g.fillRect(tx + 8, 0, 2, 3);
            g.fillRect(tx +12, 0, 2, 5);
        }
        g.fillStyle(0x5ABB5A);
        for (var tx2 = 2; tx2 < 800; tx2 += 16) {
            g.fillRect(tx2,     0, 2, 3);
            g.fillRect(tx2 + 6, 0, 2, 4);
        }
        g.generateTexture('ground', 800, 32);

        // ================================================================
        // 배경 (800×400 텍스처)
        // ================================================================
        g.clear();
        // 하늘 위쪽 (진한 파랑)
        g.fillStyle(0x5BA4CF);
        g.fillRect(0, 0, 800, 180);
        // 하늘 아래쪽 (연한 파랑)
        g.fillStyle(0x87CEEB);
        g.fillRect(0, 180, 800, 140);
        // 먼 언덕 (어두운 초록)
        g.fillStyle(0x4A8A4A);
        g.fillTriangle(0, 280, 120, 200, 240, 280);
        g.fillTriangle(180, 280, 320, 175, 460, 280);
        g.fillTriangle(380, 280, 540, 190, 700, 280);
        g.fillTriangle(600, 280, 750, 210, 800, 280);
        // 언덕 하이라이트
        g.fillStyle(0x5AAA5A);
        g.fillTriangle(20, 280, 120, 205, 220, 280);
        g.fillTriangle(200, 280, 320, 180, 440, 280);
        // 땅 색 (화면 아래)
        g.fillStyle(0x5A9A3A);
        g.fillRect(0, 280, 800, 120);
        g.fillStyle(0x4A8A2A);
        g.fillRect(0, 340, 800, 60);

        // 픽셀아트 구름 (흰 사각형 덩어리)
        function drawCloud(g, cx, cy) {
            g.fillStyle(0xFFFFFF);
            g.fillRect(cx,      cy + 8,  32, 12);
            g.fillRect(cx + 8,  cy,      20, 20);
            g.fillRect(cx + 32, cy + 6,  20, 14);
            // 그림자
            g.fillStyle(0xDDEEFF);
            g.fillRect(cx + 4,  cy + 16, 32, 4);
        }
        drawCloud(g, 60,  40);
        drawCloud(g, 240, 60);
        drawCloud(g, 450, 30);
        drawCloud(g, 640, 55);

        g.generateTexture('background', 800, 400);

        // ================================================================
        // 바위 (40×30 텍스처, pw=2 → 20×15 그리드)
        // ================================================================
        g.clear();
        var rockPixels = [];
        // 바위 형태 (타원형 그리드)
        var rockShape = [
            [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0]
        ];
        // 하이라이트 (왼쪽 위)
        var rockHL = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ];
        // 그림자 (오른쪽 아래)
        var rockSH = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0]
        ];
        for (var ry = 0; ry < 15; ry++) {
            for (var rx = 0; rx < 20; rx++) {
                if (rockShape[ry][rx]) {
                    var rc = 0x888888;
                    if (rockHL[ry][rx]) rc = 0xCCCCCC;
                    else if (rockSH[ry][rx]) rc = 0x555555;
                    rockPixels.push({x: rx, y: ry, c: rc});
                }
            }
        }
        drawPixels(g, rockPixels, 2);
        g.generateTexture('rock', 40, 30);

        // ================================================================
        // 나무 (30×60 텍스처)
        // ================================================================
        g.clear();
        // 줄기 (갈색, 하단 20px)
        g.fillStyle(0x8B5E3C);
        g.fillRect(11, 38, 8, 22);
        g.fillStyle(0x6B3E1C);
        g.fillRect(14, 38, 3, 22);
        // 잎 레이어 3겹 (삼각형 겹쳐서 볼륨감)
        g.fillStyle(0x1A6A1A);
        g.fillTriangle(15, 2, 1, 42, 29, 42);
        g.fillStyle(0x228B22);
        g.fillTriangle(15, 8, 2, 46, 28, 46);
        g.fillStyle(0x2EAA2E);
        g.fillTriangle(15, 14, 4, 48, 26, 48);
        // 왼쪽 하이라이트
        g.fillStyle(0x44CC44);
        g.fillTriangle(15, 10, 4, 36, 15, 36);
        // 잔가지 디테일
        g.fillStyle(0x1A5A1A);
        g.fillRect(6, 30, 4, 2);
        g.fillRect(20, 26, 4, 2);
        g.generateTexture('tree', 30, 60);

        // ================================================================
        // 시소 (80×24 텍스처)
        // ================================================================
        g.clear();
        // 삼각 받침대
        g.fillStyle(0x8B5E3C);
        g.fillTriangle(40, 22, 28, 12, 52, 12);
        g.fillStyle(0x6B3E1C);
        g.fillRect(37, 12, 6, 10);
        // 판자 (픽셀아트 나무 질감)
        g.fillStyle(0xC4903C);
        g.fillRect(0, 6, 80, 8);
        g.fillStyle(0xD4A04C);
        g.fillRect(0, 6, 80, 3);
        g.fillStyle(0xA47020);
        g.fillRect(0, 12, 80, 2);
        // 나무 결 (세로선)
        g.fillStyle(0xB48030);
        for (var si = 8; si < 80; si += 10) {
            g.fillRect(si, 6, 2, 8);
        }
        // 끝부분 둥근 막대
        g.fillStyle(0x555555);
        g.fillCircle(4, 10, 5);
        g.fillCircle(76, 10, 5);
        g.fillStyle(0x777777);
        g.fillCircle(4, 8, 3);
        g.fillCircle(76, 8, 3);
        g.generateTexture('seesaw', 80, 24);

        // ================================================================
        // 책상 (50×40 텍스처)
        // ================================================================
        g.clear();
        // 상판
        g.fillStyle(0xC4903C);
        g.fillRect(0, 0, 50, 10);
        g.fillStyle(0xD4A04C);
        g.fillRect(0, 0, 50, 3);
        g.fillStyle(0xA47020);
        g.fillRect(0, 8, 50, 2);
        // 나무 결
        g.fillStyle(0xB48030);
        for (var di = 8; di < 50; di += 8) {
            g.fillRect(di, 0, 1, 10);
        }
        // 다리 (금속 느낌)
        g.fillStyle(0x888888);
        g.fillRect(4,  10, 6, 30);
        g.fillRect(40, 10, 6, 30);
        g.fillStyle(0xAAAAAA);
        g.fillRect(4,  10, 2, 30);
        g.fillRect(40, 10, 2, 30);
        // 가로 연결대
        g.fillStyle(0x777777);
        g.fillRect(4, 28, 42, 4);
        g.generateTexture('desk', 50, 40);

        // ================================================================
        // 자전거 (50×40 텍스처)
        // ================================================================
        g.clear();
        // 바퀴 (두껍게)
        g.lineStyle(4, 0x222222);
        g.strokeCircle(12, 28, 11);
        g.strokeCircle(38, 28, 11);
        // 바퀴살
        g.lineStyle(1, 0x444444);
        g.lineBetween(12, 17, 12, 39);
        g.lineBetween(1,  28, 23, 28);
        g.lineBetween(4,  20, 20, 36);
        g.lineBetween(20, 20, 4,  36);
        g.lineBetween(38, 17, 38, 39);
        g.lineBetween(27, 28, 49, 28);
        g.lineBetween(30, 20, 46, 36);
        g.lineBetween(46, 20, 30, 36);
        // 허브
        g.fillStyle(0x888888);
        g.fillCircle(12, 28, 3);
        g.fillCircle(38, 28, 3);
        // 프레임
        g.lineStyle(3, 0xCC4400);
        g.lineBetween(12, 28, 25, 12); // 체인 스테이
        g.lineBetween(25, 12, 38, 28); // 시트 스테이
        g.lineBetween(12, 28, 38, 28); // 체인
        g.lineBetween(25, 12, 38, 14); // 탑 튜브
        // 핸들
        g.lineStyle(3, 0x884400);
        g.lineBetween(38, 14, 42, 8);
        g.lineBetween(40, 8,  44, 8);
        // 안장
        g.fillStyle(0x222222);
        g.fillRect(20, 8, 14, 4);
        g.fillStyle(0x444444);
        g.fillRect(20, 8, 14, 2);
        // 페달
        g.fillStyle(0x666666);
        g.fillRect(22, 26, 8, 4);
        g.generateTexture('bicycle', 50, 40);

        // ================================================================
        // 연필 (32×12 텍스처)
        // ================================================================
        g.clear();
        var pencilPixels = [
            // 지우개 (분홍, 왼쪽 cols 0-3)
            {x:0,y:1,c:0xFFAAAA},{x:1,y:1,c:0xFFAAAA},{x:2,y:1,c:0xFF9999},{x:3,y:1,c:0xFF9999},
            {x:0,y:2,c:0xFFAAAA},{x:1,y:2,c:0xFFBBBB},{x:2,y:2,c:0xFF9999},{x:3,y:2,c:0xFF9999},
            {x:0,y:3,c:0xFFAAAA},{x:1,y:3,c:0xFFAAAA},{x:2,y:3,c:0xFF9999},{x:3,y:3,c:0xFF9999},
            {x:0,y:4,c:0xFFAAAA},{x:1,y:4,c:0xFFAAAA},{x:2,y:4,c:0xFF9999},{x:3,y:4,c:0xFF9999},
            // 금속 밴드
            {x:4,y:1,c:0xCCCCCC},{x:5,y:1,c:0xEEEEEE},
            {x:4,y:2,c:0xBBBBBB},{x:5,y:2,c:0xDDDDDD},
            {x:4,y:3,c:0xBBBBBB},{x:5,y:3,c:0xDDDDDD},
            {x:4,y:4,c:0xCCCCCC},{x:5,y:4,c:0xEEEEEE},
            // 몸통 (노란색, cols 6-25)
            {x:6,y:0,c:0xFFD700},{x:7,y:0,c:0xFFD700},{x:8,y:0,c:0xFFE040},{x:9,y:0,c:0xFFD700},{x:10,y:0,c:0xFFD700},
            {x:11,y:0,c:0xFFD700},{x:12,y:0,c:0xFFE040},{x:13,y:0,c:0xFFD700},{x:14,y:0,c:0xFFD700},
            {x:15,y:0,c:0xFFD700},{x:16,y:0,c:0xFFE040},{x:17,y:0,c:0xFFD700},{x:18,y:0,c:0xFFD700},
            {x:19,y:0,c:0xFFD700},{x:20,y:0,c:0xFFE040},{x:21,y:0,c:0xFFD700},{x:22,y:0,c:0xFFD700},
            {x:23,y:0,c:0xFFD700},{x:24,y:0,c:0xFFD700},{x:25,y:0,c:0xFFD700},
            {x:6,y:1,c:0xFFE040},{x:7,y:1,c:0xFFEE60},{x:8,y:1,c:0xFFEE60},{x:9,y:1,c:0xFFE040},{x:10,y:1,c:0xFFE040},
            {x:11,y:1,c:0xFFEE60},{x:12,y:1,c:0xFFE040},{x:13,y:1,c:0xFFE040},{x:14,y:1,c:0xFFEE60},
            {x:15,y:1,c:0xFFE040},{x:16,y:1,c:0xFFEE60},{x:17,y:1,c:0xFFE040},{x:18,y:1,c:0xFFE040},
            {x:19,y:1,c:0xFFEE60},{x:20,y:1,c:0xFFE040},{x:21,y:1,c:0xFFE040},{x:22,y:1,c:0xFFEE60},
            {x:23,y:1,c:0xFFE040},{x:24,y:1,c:0xFFE040},{x:25,y:1,c:0xFFD700},
            {x:6,y:2,c:0xFFD700},{x:7,y:2,c:0xFFE040},{x:8,y:2,c:0xFFD700},{x:9,y:2,c:0xFFD700},{x:10,y:2,c:0xFFD700},
            {x:11,y:2,c:0xFFD700},{x:12,y:2,c:0xFFD700},{x:13,y:2,c:0xFFE040},{x:14,y:2,c:0xFFD700},
            {x:15,y:2,c:0xFFD700},{x:16,y:2,c:0xFFD700},{x:17,y:2,c:0xFFE040},{x:18,y:2,c:0xFFD700},
            {x:19,y:2,c:0xFFD700},{x:20,y:2,c:0xFFD700},{x:21,y:2,c:0xFFE040},{x:22,y:2,c:0xFFD700},
            {x:23,y:2,c:0xFFD700},{x:24,y:2,c:0xFFD700},{x:25,y:2,c:0xFFCC00},
            {x:6,y:3,c:0xFFCC00},{x:7,y:3,c:0xFFD700},{x:8,y:3,c:0xFFD700},{x:9,y:3,c:0xFFCC00},{x:10,y:3,c:0xFFD700},
            {x:11,y:3,c:0xFFD700},{x:12,y:3,c:0xFFCC00},{x:13,y:3,c:0xFFD700},{x:14,y:3,c:0xFFD700},
            {x:15,y:3,c:0xFFCC00},{x:16,y:3,c:0xFFD700},{x:17,y:3,c:0xFFD700},{x:18,y:3,c:0xFFCC00},
            {x:19,y:3,c:0xFFD700},{x:20,y:3,c:0xFFD700},{x:21,y:3,c:0xFFCC00},{x:22,y:3,c:0xFFD700},
            {x:23,y:3,c:0xFFD700},{x:24,y:3,c:0xFFCC00},{x:25,y:3,c:0xFFCC00},
            // 끝부분 (살색)
            {x:26,y:1,c:0xF5E6C8},{x:27,y:1,c:0xF5E6C8},
            {x:26,y:2,c:0xE8D0A8},{x:27,y:2,c:0xE8D0A8},
            {x:26,y:3,c:0xF5E6C8},{x:27,y:3,c:0xF5E6C8},
            // 팁 (뾰족)
            {x:28,y:2,c:0xDDC090},{x:29,y:2,c:0xCC9060},
            {x:30,y:2,c:0xBB7040},{x:31,y:2,c:0x333333}
        ];
        drawPixels(g, pencilPixels, 1);
        g.generateTexture('pencil', 32, 12);

        // ================================================================
        // 필통 (28×20 텍스처)
        // ================================================================
        g.clear();
        // 몸통 (보라색/청록)
        g.fillStyle(0x6644AA);
        g.fillRoundedRect(0, 0, 28, 20, 4);
        // 하이라이트 (위쪽)
        g.fillStyle(0x8866CC);
        g.fillRoundedRect(2, 2, 24, 6, 3);
        // 지퍼 선
        g.fillStyle(0xDDDDDD);
        g.fillRect(2, 10, 24, 2);
        g.fillStyle(0xFFFFFF);
        g.fillRect(3, 10, 22, 1);
        // 지퍼 손잡이
        g.fillStyle(0xFFDD00);
        g.fillRect(12, 8, 4, 5);
        g.fillStyle(0xFFEE44);
        g.fillRect(13, 8, 2, 5);
        // 작은 디테일 점
        g.fillStyle(0x9966DD);
        g.fillCircle(6, 5, 2);
        g.fillCircle(22, 5, 2);
        g.generateTexture('pouch', 28, 20);

        // ================================================================
        // 가방 (32×32 텍스처)
        // ================================================================
        g.clear();
        // 본체
        g.fillStyle(0xCC3333);
        g.fillRoundedRect(2, 4, 28, 27, 5);
        // 하이라이트
        g.fillStyle(0xEE4444);
        g.fillRoundedRect(4, 6, 24, 10, 4);
        // 어두운 면 (그림자)
        g.fillStyle(0xAA2222);
        g.fillRect(2, 22, 28, 9);
        g.fillRoundedRect(2, 22, 28, 9, 3);
        // 앞주머니
        g.fillStyle(0xAA2222);
        g.fillRoundedRect(6, 18, 20, 11, 3);
        g.fillStyle(0xCC3333);
        g.fillRoundedRect(7, 19, 18, 9, 2);
        // 주머니 지퍼
        g.fillStyle(0xDDDDDD);
        g.fillRect(8, 21, 16, 1);
        // 손잡이
        g.fillStyle(0x881111);
        g.lineStyle(3, 0x881111);
        g.strokeRoundedRect(10, 1, 12, 6, 3);
        // 어깨끈 힌트
        g.fillStyle(0x881111);
        g.fillRect(2, 8, 3, 18);
        g.fillRect(27, 8, 3, 18);
        // 버클
        g.fillStyle(0xDDBB00);
        g.fillRect(2, 18, 3, 3);
        g.fillRect(27, 18, 3, 3);
        g.generateTexture('bag', 32, 32);

        // ================================================================
        // 하트 (20×18 텍스처)
        // 픽셀아트 하트 패턴:
        //   .XX.XX.
        //   XXXXXXX
        //   XXXXXXX
        //   .XXXXX.
        //   ..XXX..
        //   ...X...
        // ================================================================
        g.clear();
        var heartPixels = [
            // Row 0: .XX.XX.
            {x:1,y:0,c:0xFF2244},{x:2,y:0,c:0xFF4466},
            {x:4,y:0,c:0xFF2244},{x:5,y:0,c:0xFF4466},
            // Row 1: XXXXXXX
            {x:0,y:1,c:0xFF2244},{x:1,y:1,c:0xFF4466},{x:2,y:1,c:0xFF5577},{x:3,y:1,c:0xFF4466},
            {x:4,y:1,c:0xFF4466},{x:5,y:1,c:0xFF5577},{x:6,y:1,c:0xFF2244},
            // Row 2: XXXXXXX
            {x:0,y:2,c:0xFF2244},{x:1,y:2,c:0xFF4466},{x:2,y:2,c:0xFF5577},{x:3,y:2,c:0xFF4466},
            {x:4,y:2,c:0xFF4466},{x:5,y:2,c:0xFF4466},{x:6,y:2,c:0xFF2244},
            // Row 3: .XXXXX.
            {x:1,y:3,c:0xFF2244},{x:2,y:3,c:0xFF4466},{x:3,y:3,c:0xFF4466},
            {x:4,y:3,c:0xFF4466},{x:5,y:3,c:0xFF2244},
            // Row 4: ..XXX..
            {x:2,y:4,c:0xFF2244},{x:3,y:4,c:0xFF3355},{x:4,y:4,c:0xFF2244},
            // Row 5: ...X...
            {x:3,y:5,c:0xFF2244}
        ];
        // 2px per pixel, 7wide x 6tall grid → 14x12 실제, 여백 포함 20x18
        var heartPx = [];
        var hOffX = 3, hOffY = 3;
        heartPixels.forEach(function(p) {
            heartPx.push({x: p.x + hOffX, y: p.y + hOffY, c: p.c});
            // double size
            heartPx.push({x: p.x + hOffX + 0.5, y: p.y + hOffY, c: p.c}); // won't work with int
        });
        // 직접 fillRect 방식으로 그리기 (pw=2)
        heartPixels.forEach(function(p) {
            g.fillStyle(p.c);
            g.fillRect((p.x + hOffX) * 2, (p.y + hOffY) * 2, 2, 2);
        });
        g.generateTexture('heart', 20, 18); // 실제 pixel 영역: 6px*2+6px*2 = 14+6 offset ≈ 20x18

        // ================================================================
        // 학교 건물 (120×96 텍스처)
        // ================================================================
        g.clear();
        // 건물 본체 (크림색/주황색)
        g.fillStyle(0xF5DEB3);
        g.fillRect(10, 30, 100, 66);
        // 건물 어두운 면
        g.fillStyle(0xDDC090);
        g.fillRect(80, 30, 30, 66);
        // 지붕 (삼각형, 붉은 기와)
        g.fillStyle(0xAA2222);
        g.fillTriangle(60, 2, 5, 35, 115, 35);
        g.fillStyle(0xCC3333);
        g.fillTriangle(60, 4, 8, 35, 112, 35);
        // 지붕 하이라이트 줄
        g.fillStyle(0xDD4444);
        for (var ri = 0; ri < 6; ri++) {
            var ry2 = 8 + ri * 4;
            var rw = 10 + ri * 18;
            g.fillRect(60 - rw/2, ry2, rw, 2);
        }
        // 창문 (파란색, 십자 구분)
        function drawWindow(g, wx, wy, ww, wh) {
            g.fillStyle(0xAADDFF);
            g.fillRect(wx, wy, ww, wh);
            g.fillStyle(0x88BBDD);
            g.fillRect(wx, wy, ww, wh/2);
            g.fillStyle(0xFFFFFF);
            g.fillRect(wx + ww/2 - 1, wy, 2, wh);
            g.fillRect(wx, wy + wh/2 - 1, ww, 2);
            g.lineStyle(1, 0x555577);
            g.strokeRect(wx, wy, ww, wh);
        }
        drawWindow(g, 16, 38, 20, 18);
        drawWindow(g, 50, 38, 20, 18);
        drawWindow(g, 84, 38, 20, 18);
        drawWindow(g, 16, 62, 20, 18);
        drawWindow(g, 84, 62, 20, 18);
        // 문 (갈색)
        g.fillStyle(0x8B5E3C);
        g.fillRect(46, 68, 28, 28);
        g.fillStyle(0xA07040);
        g.fillRect(48, 70, 24, 26);
        // 문 손잡이
        g.fillStyle(0xDDBB00);
        g.fillCircle(68, 83, 2);
        // 문 유리 창
        g.fillStyle(0xAADDFF);
        g.fillRect(49, 71, 10, 12);
        g.fillRect(61, 71, 10, 12);
        // 입구 계단
        g.fillStyle(0xCCBB99);
        g.fillRect(40, 94, 40, 4);
        // 간판 (문 위)
        g.fillStyle(0x3355AA);
        g.fillRect(38, 60, 44, 8);
        g.fillStyle(0xFFFFFF);
        // 간판 텍스트 픽셀 (School)
        var signPixels = [
            // S
            {x:1,y:1},{x:2,y:1},{x:3,y:1},
            {x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2},
            {x:0,y:3},{x:1,y:3},
            {x:1,y:4},{x:2,y:4},{x:3,y:4},
            // 나머지는 장식
        ];
        signPixels.forEach(function(p) {
            g.fillRect(40 + p.x * 2, 61 + p.y, 2, 1);
        });
        // 국기 깃대
        g.fillStyle(0x888888);
        g.fillRect(59, 2, 2, 30);
        g.fillStyle(0xFF2244);
        g.fillRect(61, 2, 12, 8);
        g.fillStyle(0x0022CC);
        g.fillRect(61, 10, 12, 8);
        // 벽 선 디테일 (수평)
        g.fillStyle(0xCCAA80);
        for (var wi = 0; wi < 3; wi++) {
            g.fillRect(10, 30 + wi * 22, 100, 1);
        }
        g.generateTexture('school', 120, 96);

        // ── 수학 문제 박스 (40×40, 황금색 물음표 박스) ──────────────
        g.clear();
        // 박스 배경
        g.fillStyle(0xFFCC00);
        g.fillRect(0, 0, 40, 40);
        // 테두리
        g.fillStyle(0xFF8800);
        g.fillRect(0, 0, 40, 3);
        g.fillRect(0, 37, 40, 3);
        g.fillRect(0, 0, 3, 40);
        g.fillRect(37, 0, 3, 40);
        // 반짝임 하이라이트
        g.fillStyle(0xFFEE55);
        g.fillRect(4, 4, 12, 4);
        g.fillRect(4, 4, 4, 10);
        // "?" 픽셀아트 (흰색)
        g.fillStyle(0xFFFFFF);
        // ? 상단 곡선
        g.fillRect(14, 8, 12, 3);
        g.fillRect(23, 11, 3, 5);
        g.fillRect(17, 14, 9, 3);
        g.fillRect(17, 17, 3, 5);
        // ? 점
        g.fillRect(17, 25, 6, 5);
        g.generateTexture('math_box', 40, 40);

        // ── 방패 (56×56, 파란 발광 링) ──────────────────────────────
        g.clear();
        g.lineStyle(4, 0x00AAFF, 1);
        g.strokeCircle(28, 28, 24);
        g.lineStyle(2, 0x88DDFF, 0.6);
        g.strokeCircle(28, 28, 20);
        g.generateTexture('shield', 56, 56);

        // ── 폭탄 (44×44, 픽셀아트 폭탄) ─────────────────────────────
        g.clear();
        // 폭탄 몸통 (검정 원)
        g.fillStyle(0x111111);
        g.fillCircle(22, 26, 16);
        // 하이라이트
        g.fillStyle(0x444444);
        g.fillCircle(16, 19, 5);
        // 심지 줄기
        g.lineStyle(3, 0x8B4513);
        g.lineBetween(22, 10, 28, 4);
        // 불꽃
        g.fillStyle(0xFF6600);
        g.fillCircle(30, 3, 4);
        g.fillStyle(0xFFCC00);
        g.fillCircle(30, 3, 2);
        // 폭탄 텍스트 "💣" 대신 픽셀로 X 표시
        g.fillStyle(0xFF2222);
        g.fillRect(17, 22, 4, 4);
        g.fillRect(25, 22, 4, 4);
        g.fillRect(17, 28, 4, 4);
        g.fillRect(25, 28, 4, 4);
        g.generateTexture('bomb', 44, 44);

        // ── 코인 (24x24, 황금색 원) ──────────────────────────────────
        g.clear();
        g.fillStyle(0xFFD700);
        g.fillCircle(12, 12, 10);
        g.fillStyle(0xFFF0A0);
        g.fillCircle(9, 9, 4);
        g.fillStyle(0xDAA520);
        g.lineStyle(2, 0xDAA520);
        g.strokeCircle(12, 12, 10);
        // W 심볼
        g.fillStyle(0x8B6914);
        g.fillRect(8, 8, 2, 8);
        g.fillRect(14, 8, 2, 8);
        g.fillRect(7, 11, 10, 2);
        g.fillRect(7, 14, 10, 2);
        g.generateTexture('coin', 24, 24);

        // ── 친구 캐릭터 (귀여운 픽셀아트 학생, 32x48) ───────────────
        g.clear();
        // 머리카락 (갈색, 위쪽)
        g.fillStyle(0x5C3A1E);
        g.fillRect(8, 2, 16, 6);
        g.fillRect(6, 4, 20, 4);
        g.fillRect(6, 6, 4, 6);  // 왼쪽 구레나룻
        g.fillRect(22, 6, 4, 4); // 오른쪽 구레나룻
        // 얼굴 (피부색)
        g.fillStyle(0xFFCC99);
        g.fillRect(8, 6, 16, 14);
        // 볼터치 (분홍)
        g.fillStyle(0xFFAAAA);
        g.fillCircle(10, 15, 3);
        g.fillCircle(22, 15, 3);
        // 눈 (크고 귀엽게)
        g.fillStyle(0x000000);
        g.fillRect(10, 10, 4, 4);
        g.fillRect(18, 10, 4, 4);
        // 눈 하이라이트
        g.fillStyle(0xFFFFFF);
        g.fillRect(12, 10, 2, 2);
        g.fillRect(20, 10, 2, 2);
        // 입 (웃는 표정)
        g.fillStyle(0xCC6677);
        g.fillRect(12, 17, 8, 2);
        g.fillRect(10, 15, 2, 2);
        g.fillRect(20, 15, 2, 2);
        // 목
        g.fillStyle(0xFFCC99);
        g.fillRect(13, 20, 6, 3);
        // 교복 상의 (초록색 - 학생과 다르게)
        g.fillStyle(0x2E7D32);
        g.fillRect(6, 22, 20, 14);
        // 교복 칼라 (흰색)
        g.fillStyle(0xFFFFFF);
        g.fillRect(12, 22, 8, 4);
        g.fillRect(12, 22, 3, 8);
        g.fillRect(17, 22, 3, 8);
        // 팔 (달리는 포즈)
        g.fillStyle(0x2E7D32);
        g.fillRect(2, 22, 5, 10);  // 왼팔 앞으로
        g.fillRect(25, 26, 5, 10); // 오른팔 뒤로
        // 손
        g.fillStyle(0xFFCC99);
        g.fillRect(2, 30, 4, 4);
        g.fillRect(25, 34, 4, 4);
        // 바지 (남색)
        g.fillStyle(0x1A237E);
        g.fillRect(6, 36, 20, 8);
        // 다리 (달리는 포즈 - 교차)
        g.fillRect(6, 42, 8, 6);   // 왼다리 앞
        g.fillRect(18, 40, 8, 6);  // 오른다리 뒤
        // 신발
        g.fillStyle(0x333333);
        g.fillRect(4, 46, 10, 3);
        g.fillRect(18, 44, 10, 3);
        g.generateTexture('friend', 32, 48);

        g.destroy();

        // 다음 씬으로 전환
        this.scene.start('MenuScene');
    }
});
