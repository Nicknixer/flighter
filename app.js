var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// inits
var gravity = 0;
var widthGravity = 0;
document.onkeydown = press;
function press(key) {
    if(key.keyCode === 38) {
        gravity += -0.5;
    }
    if(key.keyCode === 40) {
        gravity += 0.5;
    }
    if(key.keyCode === 37) {
        widthGravity += -0.5;
    }
    if(key.keyCode === 39) {
        widthGravity += 0.5;
    }
};

var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'Bold',
    fill: '#FFF'
});

var startButton = new PIXI.Text('START', style);
startButton.anchor.set(0.5);
startButton.x = app.renderer.width / 2;
startButton.y = app.renderer.height / 2;
startButton.interactive = true;
startButton.buttonMode = true;
startButton.on('pointerdown', onClickToStartButton);



app.stage.addChild(startButton);

function onClickToStartButton() {
    app.stage.removeChild(startButton);
    startTheGame();
}

function startTheGame() {

    var ship = PIXI.Sprite.fromImage('sprites/ship.png');
    ship.anchor.set(0.5);
    ship.x = app.renderer.width / 2;
    ship.y = app.renderer.height / 2;
    ship.scale.x *= 0.1;
    ship.scale.y *= 0.1;
    app.stage.addChild(ship);



    app.ticker.add(function() {
        ship.y += gravity;
        ship.x += widthGravity;
        gravity += 0.1;
        if(widthGravity > 0) widthGravity -= 0.1;
        if(widthGravity < 0) widthGravity += 0.1;
        if(ship.y > app.renderer.height) {
            ship.y = app.renderer.height;
            gravity = 0;
        }
        if(ship.y < 0) {
            ship.y = 0;
            gravity = 0;
        }

        if(ship.x > app.renderer.height) {
            ship.x = app.renderer.height;
            widthGravity = 0;
        }
        if(ship.x < 0) {
            ship.x = 0;
            widthGravity = 0;
        }
    });



}
