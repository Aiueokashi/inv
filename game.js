enchant();

var MAX_ENEMY = 60;
var MAX_SHOT = 3;
var GAME_WIDTH = 1800;
var GAME_HEIGHT = 1400;
var NORMAL_SPRITE_WIDTH = 128;
var NORMAL_SPRITE_HEIGHT = 128;
var COLLISION_WIDTH = 32;
var COLLISION_HEIGHT = 32;

var core;
var player;
var playerCollision;
var enemyArray = new Array(MAX_ENEMY);
var shotArray = new Array(3);
var backGroundArray = new Array();
var oldInput = {};

window.onload = function() {
    core = new Core(GAME_WIDTH, GAME_HEIGHT);
    core.fps = 60;
    core.rootScene.backgroundColor = "black";

    core.preload('player.PNG');
    core.preload('enemy.PNG');
    core.preload('shot.PNG');
    core.preload('explosion.png');
    core.preload('space.png');

    core.onload = initGame;
    core.start();
};

function initGame() {
    for(var bid=0; bid<2; bid++) {
        backGroundArray[bid] = new Sprite(GAME_WIDTH,GAME_HEIGHT);
        backGroundArray[bid].image = core.assets['space.png'];
        backGroundArray[bid].y = -bid * GAME_HEIGHT;
        core.rootScene.addChild(backGroundArray[bid]);
    }

    player = new Sprite(NORMAL_SPRITE_WIDTH,NORMAL_SPRITE_HEIGHT);
    player.image = core.assets['player.PNG'];
    player.x = 900;
    player.y = 1100;
    player.addEventListener(Event.ENTER_FRAME,function(){
        if(core.input.right){
            player.x += 10;
        } else if(core.input.left) {
            player.x -= 10;
        }

        if(core.input.up){
            player.y -= 10;
        } else if(core.input.down) {
            player.y += 10;
        }

        if(core.input.z && !oldInput.z && player.visible===true){
            for(var i=0; i<3; i++){
                if(shotArray[i].visible===false){
                    shotArray[i].x = player.x+32;
                    shotArray[i].y = player.y-32;
                    shotArray[i].visible = true;
                    break;
                }
            }
        }

        if(player.x < 0){
            player.x = 0;
        }if(player.x > 1700) {
            player.x = 1700;
        }
        if(player.y < 0){
            player.y = 0;
        }
        if(player.y > 1200) {
            player.y = 1200;
        }
    });
    core.rootScene.addChild(player);

    playerCollision = new Sprite(COLLISION_WIDTH,COLLISION_HEIGHT);
    core.rootScene.addChild(playerCollision);

    for(var eid=0; eid<MAX_ENEMY; eid++){
        enemyArray[eid] = eid % 3 === 0 
        ? createZigzagEnemy(Math.floor(Math.random()*GAME_WIDTH), 0) 
        : createEnemy(Math.floor(Math.random()*GAME_WIDTH), 0)
        core.rootScene.addChild(enemyArray[eid]);
    }

    for(var sid=0; sid<MAX_SHOT; sid++){
        shotArray[sid] = createShot();
        core.rootScene.addChild(shotArray[sid]);
    }

    core.rootScene.addEventListener(Event.ENTER_FRAME,enterFrameByCore);
    core.keybind(32, 'z');
}

function enterFrameByCore() {
    playerCollision.x = player.x + (NORMAL_SPRITE_WIDTH - COLLISION_WIDTH)/2;
    playerCollision.y = player.y + (NORMAL_SPRITE_HEIGHT - COLLISION_HEIGHT)/2;

    for(var bid=0; bid<2; bid++){
        backGroundArray[bid].y += 3;
        if(backGroundArray[bid].y > GAME_HEIGHT) {
            backGroundArray[bid].y -= GAME_HEIGHT*2;
        }
    }

    for(var eid=0; eid<MAX_ENEMY; eid++){
        if(enemyArray[eid].visible===true && playerCollision.intersect(enemyArray[eid]) && player.visible===true){
            player.visible = false;
            core.rootScene.addChild(createExplosion(player.x+32,player.y+32));
        }
        for(var sid=0; sid<MAX_SHOT; sid++){
            if(shotArray[sid].intersect(enemyArray[eid]) &&
                shotArray[sid].visible===true && enemyArray[eid].visible===true){
                core.rootScene.addChild(createExplosion(enemyArray[eid].x+32,enemyArray[eid].y+32));
                enemyArray[eid].visible = false;
            }
        }
    }

    $.extend(true,oldInput,core.input);
}

function createEnemy(posx,posy) {
    var lenemy = new Sprite(NORMAL_SPRITE_WIDTH,NORMAL_SPRITE_HEIGHT);
    lenemy.image = core.assets['enemy.PNG'];
    lenemy.x = posx;
    lenemy.y = posy;
    lenemy.addEventListener(Event.ENTER_FRAME,function(){
        lenemy.y += 2;
    });
    return lenemy;
}

function createShot(){
    var lshot = new Sprite(64,128);
    lshot.image = core.assets['shot.PNG'];
    lshot.visible = false;
    lshot.opacity = 0.8;
    lshot.addEventListener(Event.ENTER_FRAME,function(){
        lshot.y -= 18;
        if(lshot.y < -128) {
            lshot.visible = false;
        }
    });
    return lshot;
}

function createExplosion(posx,posy) {
    var lexplosion = new Sprite(96,96);
    lexplosion.image = core.assets['explosion.png'];
    lexplosion.x = posx;
    lexplosion.y = posy;
    lexplosion.scaleX = 2;
    lexplosion.scaleY = 2;
    lexplosion.frame = 0;
    lexplosion.opacity = 0.8;
    lexplosion.addEventListener(Event.ENTER_FRAME,function(){
        lexplosion.frame ++;
        if(lexplosion.frame > 12){
            core.rootScene.removeChild(lexplosion);
        }
    });
    return lexplosion;
}

function createZigzagEnemy(posx, posy) {
    var lenemy = new Sprite(NORMAL_SPRITE_WIDTH,NORMAL_SPRITE_HEIGHT);
    lenemy.image = core.assets['enemy.PNG'];
    lenemy.x = posx;
    lenemy.y = posy;
    lenemy.tl.moveBy(Math.floor(Math.random()*150),40,15)
        .moveBy(Math.floor(Math.random()*-150),40,15)
        .moveBy(Math.floor(Math.random()*-150),40,15)
        .moveBy(Math.floor(Math.random()*150),40,15)
        .loop();

    return lenemy;
}
