// MenuScene.js - 메뉴 씬
// 게임 시작 화면

var MenuScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function MenuScene() {
        Phaser.Scene.call(this, { key: 'MenuScene' });
    },

    create: function () {
        var width = this.scale.width;   // 800
        var height = this.scale.height; // 400

        // ── 배경 ────────────────────────────────────────────────────
        this.add.image(width / 2, height / 2, 'background');

        // ── 장식용 구름들 ────────────────────────────────────────────
        this.drawCloud(150, 80, 0xffffff);
        this.drawCloud(550, 60, 0xf0f0f0);
        this.drawCloud(350, 100, 0xffffff);

        // ── 제목 패널 (반투명) ───────────────────────────────────────
        var panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.85);
        panel.fillRoundedRect(width / 2 - 280, 60, 560, 260, 20);
        panel.lineStyle(4, 0x4ecdc4);
        panel.strokeRoundedRect(width / 2 - 280, 60, 560, 260, 20);

        // ── 제목 텍스트 ──────────────────────────────────────────────
        this.add.text(width / 2, 130, '학생 달리기! 🏃', {
            fontSize: '52px',
            fontFamily: 'Arial, sans-serif',
            fill: '#e74c3c',
            stroke: '#c0392b',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // ── 부제목 ───────────────────────────────────────────────────
        this.add.text(width / 2, 195, '집에서 학교까지 달려가자!', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            fill: '#2c3e50',
            align: 'center'
        }).setOrigin(0.5);

        // ── 조작 안내 ────────────────────────────────────────────────
        this.add.text(width / 2, 235, '[ 점프: 스페이스바 / 위 방향키 / 화면 터치 ]', {
            fontSize: '15px',
            fontFamily: 'Arial, sans-serif',
            fill: '#7f8c8d',
            align: 'center'
        }).setOrigin(0.5);

        // ── 시작 안내 텍스트 (깜빡임 효과) ──────────────────────────
        var startText = this.add.text(width / 2, 285, '▶  스페이스바를 눌러 시작  ◀', {
            fontSize: '24px',
            fontFamily: 'Arial, sans-serif',
            fill: '#27ae60',
            stroke: '#1e8449',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);

        // 깜빡임 트윈
        this.tweens.add({
            targets: startText,
            alpha: 0.2,
            duration: 700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // ── 게임 설명 ────────────────────────────────────────────────
        this.add.text(width / 2, 340, '5개 목숨 | 5개 레벨을 클리어하자!', {
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // 최고 기록 표시 (localStorage)
        var bestScore = localStorage.getItem('studentRunBest') || 0;
        var bestLevel = localStorage.getItem('studentRunBestLevel') || 1;
        this.add.text(width / 2, 370, '최고 기록: 레벨 ' + bestLevel + ' | 코인 ' + bestScore + '개', {
            fontSize: '16px', fill: '#FFD700', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        // ── 키보드 입력 ──────────────────────────────────────────────
        var spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        spaceKey.once('down', function () {
            this.scene.start('GameScene');
        }, this);

        // 엔터키도 지원
        var enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        enterKey.once('down', function () {
            this.scene.start('GameScene');
        }, this);

        // 마우스/터치 클릭으로 시작
        this.input.once('pointerdown', function () {
            this.scene.start('GameScene');
        }, this);

        // ── 장식용 학생 캐릭터 ───────────────────────────────────────
        var deco = this.add.image(80, 350, 'student').setScale(1.5);
        // 좌우 이동 애니메이션
        this.tweens.add({
            targets: deco,
            x: 130,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    },

    // 구름 그리기 헬퍼 함수
    drawCloud: function (x, y, color) {
        var g = this.add.graphics();
        g.fillStyle(color, 0.9);
        g.fillCircle(x, y, 25);
        g.fillCircle(x + 28, y, 35);
        g.fillCircle(x + 60, y, 25);
        g.fillRect(x, y, 60, 25);
    }
});
