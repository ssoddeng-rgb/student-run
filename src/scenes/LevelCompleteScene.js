// LevelCompleteScene.js - 레벨 클리어 씬 (800x400 레이아웃)

var LevelCompleteScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function() { Phaser.Scene.call(this, { key: 'LevelCompleteScene' }); },

    init: function(data) {
        this.levelData = data;
        this.coins = data.coins || 0;
        this.lives = data.lives || 1;
        this.shopItems = { extraLife: false, shield: false, coinDouble: false };
    },

    create: function() {
        var w = this.scale.width;   // 800
        var h = this.scale.height;  // 400
        var self = this;
        var level = LEVELS[this.levelData.level - 1];
        var isLast = this.levelData.level >= 10;

        // 최고 기록 저장
        var prev = parseInt(localStorage.getItem('studentRunBest') || '0');
        if (this.levelData.coins > prev) localStorage.setItem('studentRunBest', this.levelData.coins);
        var prevLevel = parseInt(localStorage.getItem('studentRunBestLevel') || '1');
        if (this.levelData.level > prevLevel) localStorage.setItem('studentRunBestLevel', this.levelData.level);

        // ── 배경 ─────────────────────────────────────────────────────
        var bg = this.add.graphics();
        bg.fillStyle(0x0d1b2a); bg.fillRect(0, 0, w, h);
        // 별 장식
        for (var i = 0; i < 40; i++) {
            var s = this.add.graphics();
            s.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.2, 0.8));
            s.fillCircle(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), Phaser.Math.Between(1, 2));
        }

        // ── 중앙 구분선 ──────────────────────────────────────────────
        var divider = this.add.graphics();
        divider.lineStyle(1, 0x334466, 0.8);
        divider.lineBetween(w / 2, 10, w / 2, h - 10);

        // ════════════════════════════════════════
        // 왼쪽: 결과
        // ════════════════════════════════════════
        var lx = w / 4; // 왼쪽 중심 x=200

        // 제목
        var title = this.add.text(lx, -40, isLast ? '🏆 모두 클리어!' : '🎉 레벨 클리어!', {
            fontSize: '28px', fill: '#FFD700', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, y: 22, duration: 500, ease: 'Back.easeOut' });

        // 레벨 이름
        this.add.text(lx, 52, level.name + ' 완료!', {
            fontSize: '17px', fill: '#aaddff', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // 별점
        var stars = this.levelData.lives >= 4 ? 3 : this.levelData.lives >= 2 ? 2 : 1;
        var starStr = '';
        for (var si = 0; si < 3; si++) starStr += (si < stars ? '★' : '☆');
        this.add.text(lx, 74, starStr, {
            fontSize: '30px', fill: '#FFD700'
        }).setOrigin(0.5);

        // 통계 박스
        var statBg = this.add.graphics();
        statBg.fillStyle(0x162040, 0.9);
        statBg.fillRoundedRect(lx - 170, 100, 340, 105, 10);

        var accuracy = this.levelData.mathTotal > 0
            ? Math.round(this.levelData.mathCorrect / this.levelData.mathTotal * 100) : 0;

        var stats = [
            '🏃 달린 거리: ' + Math.floor(this.levelData.distance / 10) + 'm',
            '💰 수집 코인: ' + this.levelData.coins + '개',
            '🧮 수학 정답: ' + accuracy + '% (' + this.levelData.mathCorrect + '/' + this.levelData.mathTotal + ')',
            '🔥 최대 콤보: ' + this.levelData.maxCombo + 'x'
        ];
        stats.forEach(function(st, i) {
            self.add.text(lx, 116 + i * 24, st, {
                fontSize: '14px', fill: '#ccccee'
            }).setOrigin(0.5);
        });

        // 다음 스토리 힌트
        if (!isLast) {
            var nextLevel = LEVELS[this.levelData.level];
            if (nextLevel) {
                this.add.text(lx, 215, '다음: ' + nextLevel.story, {
                    fontSize: '13px', fill: '#88aacc', fontStyle: 'italic'
                }).setOrigin(0.5);
            }
        }

        // ════════════════════════════════════════
        // 오른쪽: 상점 + 버튼
        // ════════════════════════════════════════
        var rx = w * 3 / 4; // 오른쪽 중심 x=600

        // 상점 제목
        this.add.text(rx, 18, '🛒 상점', {
            fontSize: '20px', fill: '#FFD700', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5);

        // 보유 코인
        this.coinDisplay = this.add.text(rx, 42, '💰 보유 코인: ' + this.coins, {
            fontSize: '14px', fill: '#FFD700'
        }).setOrigin(0.5);

        // 상점 아이템 (3개 세로 배치)
        var shopDefs = [
            { key: 'extraLife',  label: '💖 목숨 +1',    cost: 10, y: 65 },
            { key: 'shield',     label: '🛡️ 방패 시작',  cost: 15, y: 110 },
            { key: 'coinDouble', label: '💨 코인 2배',    cost: 20, y: 155 }
        ];

        shopDefs.forEach(function(item) {
            var canBuy = self.coins >= item.cost && !self.shopItems[item.key];
            if (item.key === 'extraLife' && self.lives >= 5) canBuy = false;

            var bx = rx - 140;
            var by = item.y;
            var bw = 280;
            var bh = 36;

            var btnBg = self.add.graphics();
            btnBg.fillStyle(canBuy ? 0x27ae60 : 0x444444);
            btnBg.fillRoundedRect(bx, by, bw, bh, 8);

            self.add.text(rx - 40, by + bh / 2, item.label, {
                fontSize: '14px', fill: '#ffffff'
            }).setOrigin(0.5);
            var costTxt = self.add.text(rx + 90, by + bh / 2, item.cost + '코인', {
                fontSize: '13px', fill: canBuy ? '#FFD700' : '#888'
            }).setOrigin(0.5);

            if (canBuy) {
                btnBg.setInteractive(
                    new Phaser.Geom.Rectangle(bx, by, bw, bh),
                    Phaser.Geom.Rectangle.Contains
                );
                btnBg.on('pointerdown', function() {
                    self.coins -= item.cost;
                    self.shopItems[item.key] = true;
                    if (item.key === 'extraLife') self.lives = Math.min(5, self.lives + 1);
                    btnBg.clear();
                    btnBg.fillStyle(0x666666);
                    btnBg.fillRoundedRect(bx, by, bw, bh, 8);
                    btnBg.removeInteractive();
                    costTxt.setColor('#888888');
                    self.coinDisplay.setText('💰 보유 코인: ' + self.coins);
                });
                btnBg.on('pointerover', function() { self.game.canvas.style.cursor = 'pointer'; });
                btnBg.on('pointerout', function()  { self.game.canvas.style.cursor = 'default'; });
            }
        });

        // ── 네비게이션 버튼 ────────────────────────────────────────
        // 다음 레벨 버튼
        var nextLabel = isLast ? '🔄 처음부터' : '다음 레벨 ▶';
        var nextBtn = this.add.text(rx, 245, nextLabel, {
            fontSize: '20px', fill: '#ffffff', backgroundColor: '#2ecc71',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive();

        nextBtn.on('pointerdown', function() {
            var nextLevel = isLast ? 1 : self.levelData.level + 1;
            self.scene.start('GameScene', {
                level: nextLevel,
                lives: isLast ? 5 : Math.min(5, self.lives),
                coins: isLast ? 0 : self.coins,
                startWithShield: self.shopItems.shield,
                coinDouble: self.shopItems.coinDouble
            });
        });

        // 메뉴 버튼
        var menuBtn = this.add.text(rx, 305, '◀ 메뉴로', {
            fontSize: '18px', fill: '#ffffff', backgroundColor: '#e74c3c',
            padding: { x: 20, y: 8 }
        }).setOrigin(0.5).setInteractive();

        menuBtn.on('pointerdown', function() {
            self.scene.start('MenuScene');
        });

        // 호버 효과
        [nextBtn, menuBtn].forEach(function(btn) {
            btn.on('pointerover', function() {
                btn.setScale(1.05);
                self.game.canvas.style.cursor = 'pointer';
            });
            btn.on('pointerout', function() {
                btn.setScale(1);
                self.game.canvas.style.cursor = 'default';
            });
        });

        // 레벨 번호 표시
        this.add.text(rx, 360, 'LEVEL ' + this.levelData.level + ' / 10', {
            fontSize: '13px', fill: '#556688'
        }).setOrigin(0.5);
    }
});
