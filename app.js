var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);

// inits
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
    //startTheGame();
}
