var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
// inits
document.onmousemove = mouse_position;
var x, y;
function mouse_position(e) {
    x = e.x;
    y = e.y;
}


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
    let body = document.querySelector("body");
    body.style.cssText = "cursor: none";
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
        ship.x = x;
        ship.y = y;
        if(ship.y > app.renderer.height - 20) {
            ship.y = app.renderer.height - 20;
        }
        if(ship.y < 100) {
            ship.y = 100;
        }

        if(ship.x > app.renderer.width - 40) {
            ship.x = app.renderer.width - 40;
        }
        if(ship.x < 40) {
            ship.x = 40;
        }
    });

}




