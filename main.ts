// Define custom sprite kinds
namespace SpriteKind {
    export const Platform = SpriteKind.create()
}

// Create assets first
let forest_background = img`
    9999999999999999
    9999999999999999
    9999999999999999
    9999999999999999
`;

let player_img = img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . 2 2 2 2 2 2 . . . . .
    . . . . 2 2 2 2 2 2 2 2 . . . .
    . . . . 2 2 f 2 2 f 2 2 . . . .
    . . . . 2 2 2 2 2 2 2 2 . . . .
    . . . . . 2 2 2 2 2 2 . . . . .
    . . . . . . 2 2 2 2 . . . . . .
`;

let platform_img = img`
    7777777777777777
    7777777777777777
    7777777777777777
    7777777777777777
`;

let coin_img = img`
    . . . 5 5 5 . .
    . . 5 5 5 5 5 .
    . 5 5 5 5 5 5 5
    . . 5 5 5 5 5 .
    . . . 5 5 5 . .
`;

// Game configuration
namespace game {
    // Constants for game settings
    const PLAYER_SPEED = 100;
    const JUMP_VELOCITY = -150;
    const GRAVITY = 300;
    const GROUND_LEVEL = 120;
    const PLATFORM_SPEED = 50;

    // Score tracking
    let score = 0;

    // Sprite references
    let player: Sprite = null;
    let platforms: Sprite[] = [];
    let collectibles: Sprite[] = [];

    // Game state variables
    let isJumping = false;
    let gameStarted = false;

    // Initialize the game
    startGame();

    function startGame() {
        // Set up scene
        scene.setBackgroundColor(9);
        scene.setBackgroundImage(forest_background);

        // Create player sprite
        player = sprites.create(player_img, SpriteKind.Player);
        player.setPosition(30, GROUND_LEVEL);
        player.ay = GRAVITY; // Apply gravity

        // Initialize controls
        controller.moveSprite(player, PLAYER_SPEED, 0);

        // Set up jump button
        controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
            if (!isJumping) {
                player.vy = JUMP_VELOCITY;
                isJumping = true;
            }
        });

        // Start platform generation
        generateInitialPlatforms();
        game.onUpdate(updateGame);

        // Score display
        info.setScore(0);

        // Start the game
        gameStarted = true;
    }

    // Platform generation
    function generateInitialPlatforms() {
        // Create initial set of platforms
        for (let i = 0; i < 3; i++) {
            createPlatform(160 * (i + 1));
        }
    }

    function createPlatform(x: number) {
        const platform = sprites.create(platform_img, SpriteKind.Platform);
        platform.setPosition(x, randint(60, 100));
        platform.vx = -PLATFORM_SPEED;
        platforms.push(platform);

        // Add collectible above platform
        if (Math.random() < 0.7) { // 70% chance
            createCollectible(x, platform.y - 20);
        }
    }

    function createCollectible(x: number, y: number) {
        const collectible = sprites.create(coin_img, SpriteKind.Food);
        collectible.setPosition(x, y);
        collectible.vx = -PLATFORM_SPEED;
        collectibles.push(collectible);
    }

    // Main game update loop
    function updateGame() {
        if (!gameStarted) return;

        // Check if player is on ground or platform
        if (player.y >= GROUND_LEVEL) {
            player.y = GROUND_LEVEL;
            isJumping = false;
        }

        // Platform management
        for (let i = platforms.length - 1; i >= 0; i--) {
            const platform = platforms[i];

            // Remove off-screen platforms
            if (platform.x < -20) {
                platforms.removeAt(i);
                platform.destroy();
            }
        }

        // Generate new platforms
        if (platforms.length < 3) {
            createPlatform(160);
        }

        // Collectible management
        for (let i = collectibles.length - 1; i >= 0; i--) {
            const collectible = collectibles[i];

            // Remove off-screen collectibles
            if (collectible.x < -20) {
                collectibles.removeAt(i);
                collectible.destroy();
            }
        }

        // Check game over conditions
        if (player.y > screen.height) {
            gameOver();
        }
    }

    // Collision handling
    sprites.onOverlap(SpriteKind.Player, SpriteKind.Platform, function (sprite: Sprite, otherSprite: Sprite) {
        // Only handle collision if player is moving downward
        if (sprite.vy > 0 && sprite.y < otherSprite.y) {
            sprite.vy = 0;
            sprite.y = otherSprite.y - sprite.height / 2;
            isJumping = false;
        }
    });

    sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite: Sprite, otherSprite: Sprite) {
        otherSprite.destroy();
        info.changeScoreBy(1);
        music.baDing.play();
    });

    // Game over handling
    function gameOver() {
        gameStarted = false;
        game.over(false);
    }
}