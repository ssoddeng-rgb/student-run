// 학생 달리기! - 메인 게임 설정
// Phaser 3를 사용한 사이드스크롤 러닝 게임

var config = {
    type: Phaser.AUTO,          // WebGL 우선, 실패시 Canvas 사용
    width: 800,
    height: 400,
    pixelArt: true,             // 픽셀아트 렌더링 (안티앨리어싱 비활성화)
    backgroundColor: '#87CEEB', // 하늘색 배경
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1200 }, // 중력 설정
            debug: false          // 디버그 모드 끄기
        }
    },
    // 씬 등록 (순서대로 로드됨)
    scene: [BootScene, MenuScene, GameScene, LevelCompleteScene, GameOverScene]
};

// 게임 인스턴스 생성
var game = new Phaser.Game(config);
