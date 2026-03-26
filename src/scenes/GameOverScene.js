// GameOverScene.js - 게임 오버 / 클리어 씬
// 게임 결과 화면 (승리 또는 패배)

var GameOverScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function GameOverScene() {
        Phaser.Scene.call(this, { key: 'GameOverScene' });
    },

    // init()으로 이전 씬에서 데이터 받기
    init: function (data) {
        this.win = data.win || false;
        this.finalDistance = data.distance || 0;
        this.level = data.level || 1;
        this.finalCoins = data.coins || 0;
        this.mathCorrect = data.mathCorrect || 0;
        this.mathTotal = data.mathTotal || 0;
        this.maxCombo = data.maxCombo || 0;
    },

    create: function () {
        var self = this;
        var width = this.scale.width;   // 800
        var height = this.scale.height; // 400

        // ── 배경 ────────────────────────────────────────────────────
        this.add.image(width / 2, height / 2, 'background');

        // ── 배경 오버레이 ────────────────────────────────────────────
        var overlay = this.add.graphics();
        if (this.win) {
            // 승리: 밝은 노란 오버레이
            overlay.fillStyle(0xFFD700, 0.25);
        } else {
            // 패배: 어두운 오버레이
            overlay.fillStyle(0x000000, 0.55);
        }
        overlay.fillRect(0, 0, width, height);

        // ── 결과 패널 ────────────────────────────────────────────────
        var panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.92);
        panel.fillRoundedRect(width / 2 - 300, 50, 600, 300, 24);
        panel.lineStyle(5, this.win ? 0xFFD700 : 0xe74c3c);
        panel.strokeRoundedRect(width / 2 - 300, 50, 600, 300, 24);

        if (this.win) {
            // ── 승리 화면 ────────────────────────────────────────────

            // 별 장식
            this.spawnStars();

            // 승리 제목
            var titleText = this.add.text(width / 2, 110, '학교 도착! 🎉', {
                fontSize: '52px',
                fontFamily: 'Arial, sans-serif',
                fill: '#e74c3c',
                stroke: '#c0392b',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);

            // 제목 등장 애니메이션
            titleText.setScale(0);
            this.tweens.add({
                targets: titleText,
                scaleX: 1,
                scaleY: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });

            // 서브 메시지
            this.add.text(width / 2, 180, '잘 달렸어요! 대단해요! 🏆', {
                fontSize: '26px',
                fontFamily: 'Arial, sans-serif',
                fill: '#27ae60',
                stroke: '#1e8449',
                strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5);

        } else {
            // ── 패배 화면 ────────────────────────────────────────────

            // 게임 오버 제목
            var loseTitle = this.add.text(width / 2, 110, '게임 오버 😢', {
                fontSize: '52px',
                fontFamily: 'Arial, sans-serif',
                fill: '#e74c3c',
                stroke: '#c0392b',
                strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5);

            // 흔들림 효과
            this.tweens.add({
                targets: loseTitle,
                x: width / 2 + 8,
                duration: 80,
                ease: 'Linear',
                yoyo: true,
                repeat: 5
            });

            // 격려 메시지
            this.add.text(width / 2, 180, '다시 도전해봐요! 💪', {
                fontSize: '26px',
                fontFamily: 'Arial, sans-serif',
                fill: '#e67e22',
                stroke: '#d35400',
                strokeThickness: 2,
                align: 'center'
            }).setOrigin(0.5);
        }

        // ── 레벨 표시 ───────────────────────────────────────────────────
        this.add.text(width / 2, 215, '레벨 ' + this.level + ' 에서 실패', {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fill: '#7f8c8d',
            align: 'center'
        }).setOrigin(0.5);

        // ── 달린 거리 표시 ───────────────────────────────────────────
        this.add.text(width / 2, 240, '달린 거리: ' + this.finalDistance + 'm  |  코인: ' + this.finalCoins, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5);

        // ── 추가 스탯 ──────────────────────────────────────────────────
        this.add.text(width / 2, 265, '수학: ' + this.mathCorrect + '/' + this.mathTotal + '  |  최대 콤보: ' + this.maxCombo + 'x', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fill: '#7f8c8d',
            align: 'center'
        }).setOrigin(0.5);

        // 최고 기록 저장
        var prev = parseInt(localStorage.getItem('studentRunBest') || '0');
        if (this.finalCoins > prev) localStorage.setItem('studentRunBest', this.finalCoins);
        var prevLevel = parseInt(localStorage.getItem('studentRunBestLevel') || '1');
        if (this.level > prevLevel) localStorage.setItem('studentRunBestLevel', this.level);

        // ── 다시 시작 버튼 ───────────────────────────────────────────
        var restartBtn = this.createButton(width / 2 - 110, 320, '🔄 다시 시작', 0x27ae60, 0x1e8449);
        restartBtn.on('pointerdown', function () {
            self.scene.start('GameScene');
        });

        // ── 메뉴 버튼 ────────────────────────────────────────────────
        var menuBtn = this.createButton(width / 2 + 110, 320, '🏠 메뉴로', 0x3498db, 0x2980b9);
        menuBtn.on('pointerdown', function () {
            self.scene.start('MenuScene');
        });

        // ── 키보드 단축키 ────────────────────────────────────────────
        // 스페이스 → 다시 시작
        var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.once('down', function () {
            self.scene.start('GameScene');
        });

        // Escape → 메뉴
        var escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.once('down', function () {
            self.scene.start('MenuScene');
        });

        // ── 하단 안내 텍스트 ─────────────────────────────────────────
        this.add.text(width / 2, 380, '스페이스바: 다시 시작  |  ESC: 메뉴', {
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // ── 장식용 캐릭터 ────────────────────────────────────────────
        var playerImg = this.add.image(50, 360, this.win ? 'student' : 'student')
            .setScale(1.2);

        if (this.win) {
            // 승리: 위아래 점프 애니메이션
            this.tweens.add({
                targets: playerImg,
                y: 330,
                duration: 400,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        } else {
            // 패배: 반투명
            playerImg.setAlpha(0.5);
        }

        // 학교 건물 장식 (승리 시)
        if (this.win) {
            this.add.image(750, 345, 'school').setScale(1.3);
        }
    },

    // ── 버튼 생성 헬퍼 ──────────────────────────────────────────────
    createButton: function (x, y, label, color, hoverColor) {
        var container = this.add.container(x, y);

        // 버튼 배경
        var bg = this.add.graphics();
        bg.fillStyle(color);
        bg.fillRoundedRect(-95, -22, 190, 44, 12);

        // 버튼 테두리
        bg.lineStyle(3, 0xffffff, 0.8);
        bg.strokeRoundedRect(-95, -22, 190, 44, 12);

        // 버튼 텍스트
        var text = this.add.text(0, 0, label, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        container.add([bg, text]);

        // 인터랙티브 영역 설정
        container.setSize(190, 44);
        container.setInteractive({ useHandCursor: true });

        var self = this;

        // 호버 효과
        container.on('pointerover', function () {
            bg.clear();
            bg.fillStyle(hoverColor);
            bg.fillRoundedRect(-95, -22, 190, 44, 12);
            bg.lineStyle(3, 0xffffff, 0.8);
            bg.strokeRoundedRect(-95, -22, 190, 44, 12);
            container.setScale(1.05);
        });

        container.on('pointerout', function () {
            bg.clear();
            bg.fillStyle(color);
            bg.fillRoundedRect(-95, -22, 190, 44, 12);
            bg.lineStyle(3, 0xffffff, 0.8);
            bg.strokeRoundedRect(-95, -22, 190, 44, 12);
            container.setScale(1);
        });

        // 클릭 효과
        container.on('pointerdown', function () {
            container.setScale(0.95);
        });

        container.on('pointerup', function () {
            container.setScale(1.05);
        });

        return container;
    },

    // ── 별점 계산 ───────────────────────────────────────────────────
    getStarRating: function (distance) {
        if (distance >= 3000) return '⭐⭐⭐ 완주!';
        if (distance >= 2000) return '⭐⭐ 아쉬워요!';
        if (distance >= 1000) return '⭐ 다시 도전!';
        return '💀 더 열심히!';
    },

    // ── 승리 시 별 파티클 효과 ──────────────────────────────────────
    spawnStars: function () {
        var self = this;
        var width = this.scale.width;
        var height = this.scale.height;

        // 여러 별을 랜덤 위치에서 생성
        for (var i = 0; i < 12; i++) {
            (function (index) {
                self.time.delayedCall(index * 100, function () {
                    var star = self.add.text(
                        Phaser.Math.Between(50, width - 50),
                        Phaser.Math.Between(30, height - 50),
                        ['⭐', '✨', '🌟'][Phaser.Math.Between(0, 2)],
                        { fontSize: Phaser.Math.Between(20, 40) + 'px' }
                    ).setAlpha(0);

                    self.tweens.add({
                        targets: star,
                        alpha: 1,
                        y: star.y - 50,
                        duration: 800,
                        ease: 'Power2',
                        yoyo: true,
                        onComplete: function () { star.destroy(); }
                    });
                });
            })(i);
        }
    }
});
