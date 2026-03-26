// GameScene.js - 메인 게임 씬
// 사이드스크롤 러닝 게임의 핵심 로직

var GameScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: 'GameScene' });
    },

    init: function(data) {
        // 레벨 데이터 초기화 (없으면 레벨 1 기본값)
        this.currentLevel = (data && data.level) ? data.level : 1;
        this.startLives = (data && data.lives) ? data.lives : 5;
        this.startCoins = (data && data.coins) ? data.coins : 0;
        this.startWithShield = (data && data.startWithShield) ? data.startWithShield : false;
        this.coinDouble = (data && data.coinDouble) ? data.coinDouble : false;
    },

    create: function () {
        var self = this;
        var width = this.scale.width;   // 800
        var height = this.scale.height; // 400

        // ── 게임 상태 변수 ───────────────────────────────────────────
        this.level = this.currentLevel || 1;
        this.levelConfig = LEVELS[this.level - 1];
        this.gameSpeed = this.levelConfig.speed;
        this.goalDistance = this.levelConfig.goalDistance;

        this.lives = this.startLives || 5;
        this.maxLives = 5;        // 최대 목숨 수
        this.distance = 0;        // 달린 거리 (픽셀)
        this.isInvincible = false; // 무적 상태 (장애물 충돌 후 1초)
        this.isGameOver = false;  // 게임 종료 플래그
        this.shownMessages = {};    // 응원 메시지 표시 여부 추적
        this.jumpsLeft = 2;        // 더블 점프 횟수
        this.obstaclesSinceItem = 0; // 아이템 없이 스폰된 장애물 수
        this.nextItemAt = Phaser.Math.Between(2, 4); // 몇 번째 장애물에 아이템 스폰

        // 방패 상태
        this.shieldCount = 0;      // 방패 남은 횟수 (0=없음)
        this.shieldSprite = null;  // 방패 시각 오브젝트
        this.shieldText = null;    // 방패 횟수 머리 위 텍스트
        // 수학 문제 상태
        this.isMathOpen = false;   // 수학 문제 UI 열림 여부
        this.mathAttempts = 0;     // 현재 문제 시도 횟수

        // 코인
        this.coins = this.startCoins || 0;
        this.coinMultiplier = this.coinDouble ? 2 : 1;

        // 콤보
        this.combo = 0;
        this.maxCombo = 0;

        // 수학 정답률
        this.mathCorrect = 0;
        this.mathTotal = 0;

        // 지각 타이머
        this.timeElapsed = 0;

        // 장애물 스폰 타이머 간격 (ms)
        this.spawnInterval = 2000;

        // ── 배경 (타일 스프라이트로 스크롤 효과) ────────────────────
        this.bg = this.add.tileSprite(0, 0, width, height, 'background')
            .setOrigin(0, 0);

        // ── 지면 그룹 (Static Physics) ───────────────────────────────
        this.groundGroup = this.physics.add.staticGroup();

        // 지면 타일을 3장 연결해 넓은 지면 생성
        for (var i = 0; i < 3; i++) {
            var tile = this.groundGroup.create(i * 800, 384, 'ground');
            tile.setOrigin(0, 0.5);
            tile.refreshBody();
        }

        // ── 플레이어 생성 ────────────────────────────────────────────
        this.player = this.physics.add.sprite(100, 320, 'student');
        this.player.setCollideWorldBounds(true); // 화면 밖으로 못 나가게
        this.player.setBounce(0.1);

        // 플레이어 충돌 박스 조정 (스프라이트보다 많이 작게 — 관대한 판정)
        this.player.setSize(14, 34);
        this.player.setOffset(8, 8);

        // ── 플레이어 지면 충돌 ───────────────────────────────────────
        this.physics.add.collider(this.player, this.groundGroup);

        // ── 장애물 그룹 ─────────────────────────────────────────────
        this.obstacles = this.physics.add.group();

        // ── 아이템 그룹 ─────────────────────────────────────────────
        this.items = this.physics.add.group();

        // ── 코인 그룹 ───────────────────────────────────────────────
        this.coinGroup = this.physics.add.group();

        // ── 친구 캐릭터 그룹 ─────────────────────────────────────────
        this.friends = this.physics.add.group();

        // ── 학교 건물 (오른쪽 고정 표시) ───────────────────────────
        this.school = this.add.image(700, 328, 'school')
            .setScrollFactor(0).setDepth(5).setScale(1.5);
        this.add.text(700, 254, '🏫 학교', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#FF6600',
            stroke: '#ffffff', strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(6);

        // ── 키보드 입력 설정 ─────────────────────────────────────────
        // 키보드 이벤트 리스너 방식 (즉각 반응)
        this.input.keyboard.on('keydown-SPACE', this.tryJump, this);
        this.input.keyboard.on('keydown-UP', this.tryJump, this);

        // 터치/마우스 입력 (수학 UI 열려있으면 점프 안 함)
        this.input.on('pointerdown', function (pointer) {
            if (self.isMathOpen) return;
            self.tryJump();
        });

        // ── 장애물 스폰 타이머 ───────────────────────────────────────
        this.spawnTimer = this.time.addEvent({
            delay: this.spawnInterval,
            callback: this.spawnObstacle,
            callbackScope: this,
            loop: true
        });

        // ── 수학 박스 거리 트리거
        var t = this.goalDistance;
        this.mathTriggers = [Math.floor(t * 0.25), Math.floor(t * 0.55), Math.floor(t * 0.85)];
        this.mathTriggered = {};

        // ── 충돌 처리: 장애물 ────────────────────────────────────────
        this.physics.add.overlap(
            this.player,
            this.obstacles,
            this.onHitObstacle,
            null,
            this
        );

        // ── 충돌 처리: 아이템 ────────────────────────────────────────
        this.physics.add.overlap(
            this.player,
            this.items,
            this.onCollectItem,
            null,
            this
        );


        // ── 충돌 처리: 코인 ──────────────────────────────────────────
        this.physics.add.overlap(this.player, this.coinGroup, this.onCollectCoin, null, this);

        // ── 충돌 처리: 친구 캐릭터 ───────────────────────────────────
        this.physics.add.overlap(this.player, this.friends, this.onHitFriend, null, this);

        // 하트 UI
        this.heartIcons = [];
        this.drawHearts();

        // 방패 시작 (상점에서 구매한 경우)
        if (this.startWithShield) {
            var self3 = this;
            this.time.delayedCall(500, function() {
                self3.shieldCount = 2;
                self3.shieldSprite = self3.add.image(self3.player.x, self3.player.y, 'shield').setDepth(8);
                self3.tweens.add({ targets: self3.shieldSprite, alpha: 0.5, duration: 400, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
                self3.shieldText = self3.add.text(self3.player.x, self3.player.y - 42, 'x2', {
                    fontSize: '16px', fontFamily: 'Arial', fill: '#00DDFF', stroke: '#000', strokeThickness: 3
                }).setOrigin(0.5).setDepth(9);
            });
        }

        // 거리 UI (우측 상단, origin(1,0)으로 오른쪽 정렬)
        this.distanceText = this.add.text(width - 15, 10, '달린 거리: 0m', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

        // 속도 표시
        this.speedText = this.add.text(width - 15, 36, '', {
            fontSize: '15px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(10);

        // 코인 UI (좌측 하단 목숨 아래)
        this.coinText = this.add.text(10, 48, '0', {
            fontSize: '18px', fontFamily: 'Arial', fill: '#FFD700',
            stroke: '#000', strokeThickness: 3
        }).setScrollFactor(0).setDepth(10);

        // 콤보 UI (중앙 상단)
        this.comboText = this.add.text(width / 2, 10, '', {
            fontSize: '22px', fontFamily: 'Arial', fill: '#FF6600',
            stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10);

        // 지각 타이머 UI
        this.timerText = this.add.text(10, 70, '08:30', {
            fontSize: '16px', fontFamily: 'Arial', fill: '#ffffff',
            stroke: '#000', strokeThickness: 2
        }).setScrollFactor(0).setDepth(10);

        // 레벨 표시
        this.add.text(width / 2, height - 20, this.levelConfig.name, {
            fontSize: '14px', fontFamily: 'Arial', fill: '#ffffff', alpha: 0.7
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(10);

        // 발판 위 먼지 파티클 (달리기 효과)
        this.dustTimer = this.time.addEvent({
            delay: 150,
            callback: this.spawnDust,
            callbackScope: this,
            loop: true
        });

        // ── 코인 스폰 타이머 (1.5초마다) ─────────────────────────────
        this.coinSpawnTimer = this.time.addEvent({
            delay: 1500, callback: this.spawnCoin, callbackScope: this, loop: true
        });

        // ── 친구 캐릭터 스폰 타이머 ──────────────────────────────────
        this.friendSpawnTimer = this.time.addEvent({
            delay: 15000, callback: this.spawnFriend, callbackScope: this, loop: true
        });

        // ── 게임 시작 애니메이션 ─────────────────────────────────────
        this.add.text(width / 2, height / 2 - 30, '출발!', {
            fontSize: '56px',
            fontFamily: 'Arial, sans-serif',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20)
            .setAlpha(0)
            .setData('created', true);

        // "출발!" 팝업 트윈
        var goText = this.add.text(width / 2, height / 2, '준비...', {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        var self2 = this;
        this.time.delayedCall(600, function () {
            goText.setText('출발! 🏃');
            goText.setStyle({ fill: '#FFD700' });
            self2.tweens.add({
                targets: goText,
                y: height / 2 - 60,
                alpha: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: function () { goText.destroy(); }
            });
        });
    },

    // ── 점프 시도 ────────────────────────────────────────────────────
    tryJump: function () {
        if (this.isGameOver) return;
        // 더블 점프: 잔여 점프 횟수가 있을 때 허용
        if (this.jumpsLeft > 0) {
            this.player.setVelocityY(-490);
            this.player.setTexture('student_jump');
            this.jumpsLeft--;
        }
    },

    // ── 장애물 스폰 ──────────────────────────────────────────────────
    spawnObstacle: function () {
        if (this.isGameOver) return;

        // 폭탄 장애물 (크기만 랜덤하게 변화)
        var groundY = 368;
        var spawnX = this.scale.width + 60;
        var spawnY = groundY - 22; // 폭탄 반지름 기준 지면 위

        // 장애물 생성
        var obstacle = this.obstacles.create(spawnX, spawnY, 'bomb');
        obstacle.setImmovable(true);
        obstacle.body.allowGravity = false;
        obstacle.setVelocityX(-this.gameSpeed);

        // 크기 살짝 랜덤 (0.8~1.3배)
        var sc = Phaser.Math.FloatBetween(0.8, 1.3);
        obstacle.setScale(sc);

        // 히트박스 관대하게
        obstacle.setSize(26, 26);

        // 아이템 스폰 결정
        this.obstaclesSinceItem++;
        if (this.obstaclesSinceItem >= this.nextItemAt) {
            this.obstaclesSinceItem = 0;
            this.nextItemAt = Phaser.Math.Between(2, 4);
            this.spawnItem(spawnX + Phaser.Math.Between(50, 150));
        }
    },

    // ── 아이템 스폰 ──────────────────────────────────────────────────
    spawnItem: function (x) {
        var types = [
            { key: 'pencil', w: 30, h: 10 },
            { key: 'pouch',  w: 25, h: 20 },
            { key: 'bag',    w: 30, h: 30 }
        ];

        var type = Phaser.Utils.Array.GetRandom(types);
        // 공중에 떠있는 위치 (y=280)
        var item = this.items.create(x, 280, type.key);
        item.body.allowGravity = false;
        item.setVelocityX(-this.gameSpeed);

        // 아이템 위아래 흔들림 효과
        this.tweens.add({
            targets: item,
            y: 260,
            duration: 600,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // 반짝임 효과
        this.tweens.add({
            targets: item,
            alpha: 0.5,
            duration: 300,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    },

    // ── 장애물 충돌 처리 ─────────────────────────────────────────────
    onHitObstacle: function (player, obstacle) {
        if (this.isInvincible || this.isGameOver) return;

        // 방패가 있으면 장애물 격파
        if (this.shieldCount > 0) {
            this.shieldCount--;
            obstacle.destroy();
            // 방패 격파 이펙트
            var fx = this.add.text(obstacle.x, obstacle.y - 20, '💥 격파!', {
                fontSize: '20px', fill: '#00AAFF',
                stroke: '#000', strokeThickness: 3
            }).setOrigin(0.5).setScrollFactor(0).setDepth(15);
            this.tweens.add({
                targets: fx, y: fx.y - 40, alpha: 0, duration: 700,
                onComplete: function () { fx.destroy(); }
            });
            if (this.shieldCount === 0) {
                if (this.shieldSprite) { this.shieldSprite.destroy(); this.shieldSprite = null; }
                if (this.shieldText) { this.shieldText.destroy(); this.shieldText = null; }
            } else {
                if (this.shieldText) this.shieldText.setText('🛡️×' + this.shieldCount);
            }
            return;
        }

        // 목숨 감소
        this.lives--;
        this.drawHearts();
        obstacle.destroy();

        // 콤보 리셋
        this.combo = 0;

        if (this.lives <= 0) {
            this.endGame(false);
        } else {
            this.setInvincible(true);
        }
    },

    // ── 아이템 수집 처리 ─────────────────────────────────────────────
    onCollectItem: function (player, item) {
        // 아이템 제거
        item.destroy();

        // 목숨 증가 (최대 5개)
        if (this.lives < this.maxLives) {
            this.lives++;
            this.drawHearts();
        }

        // 수집 효과 텍스트
        var collectText = this.add.text(player.x, player.y - 40, '+1 ❤️', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            fill: '#ff3333',
            stroke: '#ffffff',
            strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(15);

        this.tweens.add({
            targets: collectText,
            y: player.y - 100,
            alpha: 0,
            duration: 900,
            ease: 'Power2',
            onComplete: function () { collectText.destroy(); }
        });
    },

    // ── 무적 상태 설정 ───────────────────────────────────────────────
    setInvincible: function (value) {
        this.isInvincible = value;
        if (value) {
            // 알파 깜빡임 효과
            this.invincibleTween = this.tweens.add({
                targets: this.player,
                alpha: 0.2,
                duration: 120,
                ease: 'Linear',
                yoyo: true,
                repeat: -1
            });

            // 1초 후 무적 해제
            var self = this;
            this.time.delayedCall(1000, function () {
                self.setInvincible(false);
            });
        } else {
            // 무적 해제: 깜빡임 중지
            if (this.invincibleTween) {
                this.invincibleTween.stop();
                this.invincibleTween = null;
            }
            this.player.setAlpha(1);
            this.isInvincible = false;
        }
    },

    // ── 하트 UI 그리기 ───────────────────────────────────────────────
    drawHearts: function () {
        // 기존 하트 제거
        this.heartIcons.forEach(function (h) { h.destroy(); });
        this.heartIcons = [];

        // 현재 목숨 수만큼 하트 표시
        for (var i = 0; i < this.maxLives; i++) {
            var x = 20 + i * 28;
            var y = 20;
            var heart = this.add.image(x, y, 'heart')
                .setScrollFactor(0)
                .setDepth(10);

            // 빈 목숨은 반투명
            if (i >= this.lives) {
                heart.setAlpha(0.2);
            }

            this.heartIcons.push(heart);
        }
    },

    // ── 먼지 파티클 (달리기 효과) ────────────────────────────────────
    spawnDust: function () {
        if (this.isGameOver) return;
        if (!this.player.body.blocked.down) return; // 공중에서는 먼지 없음

        var dust = this.add.graphics();
        dust.fillStyle(0xccaa77, 0.6);
        dust.fillCircle(this.player.x - 10, this.player.y + 20, Phaser.Math.Between(3, 7));

        this.tweens.add({
            targets: dust,
            x: -20,
            alpha: 0,
            duration: 400,
            ease: 'Power1',
            onComplete: function () { dust.destroy(); }
        });
    },

    // ── 게임 종료 처리 ───────────────────────────────────────────────
    endGame: function (win) {
        if (this.isGameOver) return;
        this.isGameOver = true;

        // 모든 타이머 정지
        this.spawnTimer.remove();
        this.dustTimer.remove();
        if (this.coinSpawnTimer) this.coinSpawnTimer.remove();
        if (this.friendSpawnTimer) this.friendSpawnTimer.remove();
        // 수학 트리거는 거리 기반이므로 별도 정리 불필요

        // 수학 UI 열려있으면 닫기
        this.closeMathUI();
        this.physics.resume();

        // 플레이어 정지
        this.player.setVelocity(0, 0);
        this.player.body.allowGravity = false;

        // 장애물, 아이템 속도 0으로
        this.obstacles.getChildren().forEach(function (o) {
            o.setVelocityX(0);
        });
        this.items.getChildren().forEach(function (i) {
            i.setVelocityX(0);
        });
        this.coinGroup.getChildren().forEach(function (c) {
            c.setVelocityX(0);
        });
        this.friends.getChildren().forEach(function (f) {
            f.setVelocityX(0);
        });

        // 결과 화면 표시 후 씬 전환
        var self = this;
        var delay = win ? 1500 : 800;

        if (win) {
            // 학교 도착 애니메이션
            var winText = this.add.text(this.scale.width / 2, this.scale.height / 2, '학교 도착! 🎉', {
                fontSize: '48px',
                fontFamily: 'Arial, sans-serif',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 5
            }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

            this.tweens.add({
                targets: winText,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 400,
                ease: 'Back.easeOut',
                yoyo: true,
                repeat: 2
            });
        }

        this.time.delayedCall(delay, function () {
            if (win) {
                self.scene.start('LevelCompleteScene', {
                    level: self.level,
                    lives: self.lives,
                    coins: self.coins,
                    mathCorrect: self.mathCorrect,
                    mathTotal: self.mathTotal,
                    maxCombo: self.maxCombo,
                    distance: Math.floor(self.distance)
                });
            } else {
                self.scene.start('GameOverScene', {
                    win: false,
                    level: self.level,
                    distance: Math.floor(self.distance),
                    coins: self.coins,
                    mathCorrect: self.mathCorrect,
                    mathTotal: self.mathTotal,
                    maxCombo: self.maxCombo
                });
            }
        });
    },

    // ── 매 프레임 업데이트 ───────────────────────────────────────────
    update: function () {
        if (this.isGameOver) return;

        // ── 배경 스크롤 ─────────────────────────────────────────────
        this.bg.tilePositionX += this.gameSpeed / 60;

        // ── 거리 증가 ───────────────────────────────────────────────
        this.distance += this.gameSpeed / 60;

        // 방패 위치 동기화
        if (this.shieldSprite && this.shieldCount > 0) {
            this.shieldSprite.setPosition(this.player.x, this.player.y);
        }
        // 방패 횟수 텍스트 위치 동기화
        if (this.shieldText && this.shieldCount > 0) {
            this.shieldText.setPosition(this.player.x, this.player.y - 42);
        }

        // ── 지면 타일 이동 (무한 지면 효과) ─────────────────────────
        var self = this;
        this.groundGroup.getChildren().forEach(function (tile) {
            tile.x -= self.gameSpeed / 60;
            if (tile.x + 800 < 0) {
                tile.x += 800 * 3; // 맨 오른쪽으로 재배치
            }
            tile.refreshBody();
        });

        // ── 달리기/점프 텍스처 전환 + 더블점프 리셋 ─────────────────
        if (this.player.body.blocked.down) {
            this.player.setTexture('student');
            this.jumpsLeft = 2; // 착지하면 더블점프 횟수 리셋
        }

        // ── 화면 밖 장애물/아이템 제거 + 콤보 추적 ──────────────────
        var self = this;
        this.obstacles.getChildren().forEach(function (o) {
            if (o.x < 50 && !o.getData('passed')) {
                o.setData('passed', true);
                self.combo++;
                if (self.combo > self.maxCombo) self.maxCombo = self.combo;
            }
            if (o.x < -100) o.destroy();
        });
        this.items.getChildren().forEach(function (i) {
            if (i.x < -100) i.destroy();
        });
        this.coinGroup.getChildren().forEach(function (c) { if (c.x < -100) c.destroy(); });
        this.friends.getChildren().forEach(function (f) { if (f.x < -100) f.destroy(); });

        // ── UI 업데이트 ─────────────────────────────────────────────
        var traveled = Math.floor(this.distance / 10);
        this.distanceText.setText('달린 거리: ' + traveled + 'm');

        // ── 지각 타이머 업데이트 ─────────────────────────────────────
        this.timeElapsed += 1 / 60;
        var totalSeconds = Math.floor(this.timeElapsed);
        var displayMins = 8 + Math.floor((30 + totalSeconds) / 60);
        var displaySecs = (30 + totalSeconds) % 60;
        if (displayMins >= 9) { displayMins = 9; displaySecs = Math.min(displaySecs, 0); }
        this.timerText.setText('0' + displayMins + ':' + (displaySecs < 10 ? '0' : '') + displaySecs);

        // ── 콤보 표시 ────────────────────────────────────────────────
        if (this.combo >= 2) {
            this.comboText.setText(this.combo + ' 콤보!');
        } else {
            this.comboText.setText('');
        }

        // 코인 업데이트
        this.coinText.setText(this.coins + '');

        // ── 수학 박스 거리 트리거 ────────────────────────────────────
        var self2 = this;
        this.mathTriggers.forEach(function (trigger) {
            if (self2.distance >= trigger && !self2.mathTriggered[trigger]) {
                self2.mathTriggered[trigger] = true;
                self2.showMathProblem();
            }
        });

        // ── 응원 메시지 (달린 거리 기준) ─────────────────────────────
        var msgList = [
            { at: 200,  text: '📣 200m 달렸어! 파이팅!' },
            { at: 500,  text: '🎉 절반 왔어! 힘내자!' },
            { at: 800,  text: '💪 800m! 조금만 더!' },
            { at: 950,  text: '🏃 학교 바로 앞이야! 전력질주!' }
        ];
        msgList.forEach(function (m) {
            if (traveled >= m.at && !self2.shownMessages[m.at]) {
                self2.shownMessages[m.at] = true;
                self2.showEncouragingMessage(m.text);
            }
        });

        // ── 학교 도착 판정 ───────────────────────────────────────────
        if (this.distance >= this.goalDistance && !this.isGameOver) {
            this.endGame(true);
        }
    },

    // ── 수학 문제 생성 ────────────────────────────────────────────────
    generateMathProblem: function () {
        var ops = ['+', '-', '×', '÷'];
        var op = Phaser.Utils.Array.GetRandom(ops);
        var a, b, answer;

        if (op === '+') {
            a = Phaser.Math.Between(1, 15);
            b = Phaser.Math.Between(1, 15);
            answer = a + b;
        } else if (op === '-') {
            a = Phaser.Math.Between(5, 20);
            b = Phaser.Math.Between(1, a);
            answer = a - b;
        } else if (op === '×') {
            a = Phaser.Math.Between(2, 9);
            b = Phaser.Math.Between(2, 5);
            answer = a * b;
        } else { // ÷
            b = Phaser.Math.Between(2, 5);
            answer = Phaser.Math.Between(2, 9);
            a = answer * b;
        }

        return { question: a + ' ' + op + ' ' + b + ' = ?', answer: answer };
    },

    // ── 수학 문제 UI 표시 ─────────────────────────────────────────────
    showMathProblem: function () {
        if (this.isMathOpen || this.isGameOver) return;

        // 🧮 예고 메시지 1초 후 문제 표시
        var self = this;
        var notice = this.add.text(this.scale.width / 2, 130, '🧮 수학 문제 시간!', {
            fontSize: '30px', fontFamily: 'Arial',
            fill: '#FFD700', stroke: '#000', strokeThickness: 5
        }).setOrigin(0.5).setScrollFactor(0).setDepth(25);
        this.tweens.add({ targets: notice, scaleX: 1.1, scaleY: 1.1, duration: 300, yoyo: true, repeat: 1,
            onComplete: function () {
                notice.destroy();
                self._openMathUI();
            }
        });
    },

    _openMathUI: function () {
        this.isMathOpen = true;
        this.mathAttempts = 0;
        this.mathTotal++;
        this.physics.pause(); // 게임 일시정지

        var width = this.scale.width;
        var height = this.scale.height;
        var problem = this.generateMathProblem();
        this.currentAnswer = problem.answer;

        // UI 컨테이너 (나중에 한 번에 제거하기 위해)
        this.mathUI = [];

        // 반투명 배경
        var overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.65);
        overlay.fillRect(0, 0, width, height);
        overlay.setScrollFactor(0).setDepth(30);
        this.mathUI.push(overlay);

        // 문제 패널
        var panel = this.add.graphics();
        panel.fillStyle(0xFFF8DC, 1);
        panel.fillRoundedRect(width/2 - 200, height/2 - 130, 400, 260, 16);
        panel.lineStyle(4, 0xFFAA00);
        panel.strokeRoundedRect(width/2 - 200, height/2 - 130, 400, 260, 16);
        panel.setScrollFactor(0).setDepth(31);
        this.mathUI.push(panel);

        // 제목
        var title = this.add.text(width/2, height/2 - 105, '🧮 수학 문제를 풀어라!', {
            fontSize: '20px', fontFamily: 'Arial, sans-serif',
            fill: '#884400', stroke: '#FFD700', strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32);
        this.mathUI.push(title);

        // 문제 텍스트
        var qText = this.add.text(width/2, height/2 - 60, problem.question, {
            fontSize: '40px', fontFamily: 'Arial, sans-serif',
            fill: '#222222', fontStyle: 'bold'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(32);
        this.mathUI.push(qText);

        // 오답 포함 4개 보기 생성
        var answers = [problem.answer];
        while (answers.length < 4) {
            var wrong = problem.answer + Phaser.Math.Between(-10, 10);
            if (wrong !== problem.answer && wrong > 0 && answers.indexOf(wrong) === -1) {
                answers.push(wrong);
            }
        }
        Phaser.Utils.Array.Shuffle(answers);

        // 보기 버튼 (2x2 배치)
        var self = this;
        var btnColors = [0x4CAF50, 0x2196F3, 0xFF9800, 0x9C27B0];
        answers.forEach(function (ans, idx) {
            var col = idx % 2;
            var row = Math.floor(idx / 2);
            var bx = width/2 - 95 + col * 200;
            var by = height/2 + 10 + row * 60;

            var btn = self.add.graphics();
            btn.fillStyle(btnColors[idx], 1);
            btn.fillRoundedRect(bx - 80, by - 20, 160, 40, 10);
            btn.setScrollFactor(0).setDepth(32).setInteractive(
                new Phaser.Geom.Rectangle(bx - 80, by - 20, 160, 40),
                Phaser.Geom.Rectangle.Contains
            );
            self.mathUI.push(btn);

            var btnText = self.add.text(bx, by, String(ans), {
                fontSize: '24px', fontFamily: 'Arial, sans-serif',
                fill: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5).setScrollFactor(0).setDepth(33);
            self.mathUI.push(btnText);

            btn.on('pointerdown', function () {
                if (ans === self.currentAnswer) {
                    self.onCorrectAnswer();
                } else {
                    self.onWrongAnswer(qText);
                }
            });

            // 호버 효과
            btn.on('pointerover', function () {
                btn.clear();
                btn.fillStyle(0xFFFFFF, 0.3);
                btn.fillRoundedRect(bx - 80, by - 20, 160, 40, 10);
                btn.fillStyle(btnColors[idx], 1);
                btn.fillRoundedRect(bx - 82, by - 22, 160, 40, 10);
            });
            btn.on('pointerout', function () {
                btn.clear();
                btn.fillStyle(btnColors[idx], 1);
                btn.fillRoundedRect(bx - 80, by - 20, 160, 40, 10);
            });
        });
    },

    // ── 정답 처리 ─────────────────────────────────────────────────────
    onCorrectAnswer: function () {
        this.closeMathUI();
        this.physics.resume();
        this.mathCorrect++;

        // 방패 활성화
        this.shieldCount = 2;
        if (this.shieldSprite) this.shieldSprite.destroy();
        if (this.shieldText) this.shieldText.destroy();
        this.shieldSprite = this.add.image(this.player.x, this.player.y, 'shield')
            .setDepth(8);
        // 머리 위 방패 횟수 표시
        this.shieldText = this.add.text(this.player.x, this.player.y - 42, '🛡️×2', {
            fontSize: '16px', fontFamily: 'Arial',
            fill: '#00DDFF', stroke: '#000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(9);

        // 방패 반짝임
        this.tweens.add({
            targets: this.shieldSprite,
            alpha: 0.5, duration: 400,
            ease: 'Sine.easeInOut', yoyo: true, repeat: -1
        });

        // 정답 이펙트
        var fx = this.add.text(this.scale.width/2, this.scale.height/2, '🛡️ 방패 획득! (×2)', {
            fontSize: '32px', fontFamily: 'Arial, sans-serif',
            fill: '#00AAFF', stroke: '#000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(35);
        this.tweens.add({
            targets: fx, y: fx.y - 60, alpha: 0, duration: 1200,
            ease: 'Power2', onComplete: function () { fx.destroy(); }
        });
    },

    // ── 오답 처리 ─────────────────────────────────────────────────────
    onWrongAnswer: function (qText) {
        this.mathAttempts++;

        // 화면 빨간 flash
        var flash = this.add.graphics();
        flash.fillStyle(0xFF0000, 0.4);
        flash.fillRect(0, 0, this.scale.width, this.scale.height);
        flash.setScrollFactor(0).setDepth(40);
        this.tweens.add({
            targets: flash, alpha: 0, duration: 400,
            onComplete: function () { flash.destroy(); }
        });

        // 문제 흔들기
        this.tweens.add({
            targets: qText, x: qText.x + 10, duration: 50,
            ease: 'Linear', yoyo: true, repeat: 5
        });

        // 3번 틀리면 닫기
        if (this.mathAttempts >= 3) {
            var self = this;
            this.time.delayedCall(500, function () {
                self.closeMathUI();
                self.physics.resume();
            });
        }
    },

    // ── 수학 UI 닫기 ─────────────────────────────────────────────────
    closeMathUI: function () {
        this.isMathOpen = false;
        if (this.mathUI) {
            this.mathUI.forEach(function (obj) {
                if (obj && obj.destroy) obj.destroy();
            });
            this.mathUI = [];
        }
    },

    // ── 응원 메시지 표시 ──────────────────────────────────────────────
    showEncouragingMessage: function (text) {
        var msg = this.add.text(this.scale.width / 2, 85, text, {
            fontSize: '26px', fontFamily: 'Arial, sans-serif',
            fill: '#FFD700', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(15);
        this.tweens.add({
            targets: msg, y: 55, alpha: 0, duration: 2500,
            ease: 'Power2', onComplete: function () { msg.destroy(); }
        });
    },

    // ── 코인 스폰 ─────────────────────────────────────────────────────
    spawnCoin: function () {
        if (this.isGameOver) return;
        var x = this.scale.width + 30;
        var y = Phaser.Math.Between(260, 330);
        var coin = this.coinGroup.create(x, y, 'coin');
        coin.body.allowGravity = false;
        coin.setVelocityX(-this.gameSpeed);
        // 회전 효과
        this.tweens.add({ targets: coin, scaleX: 0.1, duration: 300, ease: 'Sine.easeInOut', yoyo: true, repeat: -1 });
    },

    // ── 코인 수집 ─────────────────────────────────────────────────────
    onCollectCoin: function (player, coin) {
        coin.destroy();
        var earned = 1 * this.coinMultiplier;
        this.coins += earned;
        var fx = this.add.text(player.x, player.y - 30, '+' + earned, {
            fontSize: '16px', fill: '#FFD700', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(15);
        this.tweens.add({ targets: fx, y: fx.y - 30, alpha: 0, duration: 600, onComplete: function () { fx.destroy(); } });
    },

    // ── 친구 캐릭터 스폰 ─────────────────────────────────────────────
    spawnFriend: function () {
        if (this.isGameOver) return;
        var groundY = 368;
        var friend = this.friends.create(this.scale.width + 60, groundY - 20, 'friend');
        friend.body.allowGravity = false;
        friend.setVelocityX(-this.gameSpeed * 0.7);
        friend.setImmovable(true);
        friend.setSize(20, 36);
        // 경고 텍스트
        var warn = this.add.text(this.scale.width - 30, 60, '친구가 넘어진다!', {
            fontSize: '18px', fill: '#FF4444', stroke: '#000', strokeThickness: 3
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(15);
        this.tweens.add({ targets: warn, alpha: 0, duration: 2000, onComplete: function () { warn.destroy(); } });
    },

    // ── 친구 충돌 ─────────────────────────────────────────────────────
    onHitFriend: function (player, friend) {
        if (this.isInvincible || this.isGameOver) return;
        this.onHitObstacle(player, friend);
    },

    // ── 학교 건물 스폰 ───────────────────────────────────────────────
    spawnSchool: function () {
        var groundY = 368;
        // 화면 오른쪽 끝보다 조금 더 오른쪽에서 시작
        this.school = this.add.image(this.scale.width + 100, groundY - 40, 'school');
        this.school.setScale(1.5);

        // 학교를 왼쪽으로 이동 — 플레이어(x=100)가 닿을 수 있는 위치(x=220)까지
        var self = this;
        this.tweens.add({
            targets: this.school,
            x: 220,
            duration: 4000,
            ease: 'Linear',
            onComplete: function () {
                // 학교가 화면에 나타나면 반짝임
                self.tweens.add({
                    targets: self.school,
                    alpha: 0.6,
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
            }
        });

        // "학교까지 조금만!" 알림
        var alertText = this.add.text(this.scale.width / 2, 80, '🏫 학교가 보인다! 달려!', {
            fontSize: '26px',
            fontFamily: 'Arial, sans-serif',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(15);

        this.tweens.add({
            targets: alertText,
            y: 50,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: function () { alertText.destroy(); }
        });
    }
});
