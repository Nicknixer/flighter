var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
// inits
document.onmousemove = mouse_position;
var lastTime = 0,
    meteors = [],
    verticalSpeed = 0,
    horizontalSpeed = 0,
    speed = 1.5;
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
    //body.style.cssText = "cursor: none";
    startTheGame();
}

function startTheGame() {

    var ship = PIXI.Sprite.fromImage('sprites/ship.png');
    ship.anchor.set(0.5);
    ship.x = app.renderer.width / 2;
    ship.y = app.renderer.height / 2;
    ship.width = 40;
    ship.height = 110;
    app.stage.addChild(ship);

    app.ticker.add(function() {
        let d = new Date();

        // Создаем метеоры каждую секунду
        if (d.getTime()-lastTime >= 1000) {
            lastTime = d.getTime();
            let meteor = PIXI.Sprite.fromImage('sprites/meteor.png');
            meteor.anchor.set(0.5);
            meteor.x = getRand(10, app.renderer.width - 10);
            meteor.y = 0;
            console.log(meteor.width);
            meteor.scaleArg = getRand(-5, 5) / 200;
            meteor.scale.x *= 0.1;
            meteor.scale.y *= 0.1;
            meteors.push(meteor);
            app.stage.addChild(meteor);
        }

        // Крутим метеоры
        meteors.forEach(function (meteor, i) {
            meteor.rotation += meteor.scaleArg;
            meteor.y += 1;
            // Удаляем метеоры, вылетевшие за экран
            if(meteor.y > app.renderer.height) {
                app.stage.removeChild(meteor);
                meteors.splice(i, 1);
            }
        });

        if(ship.x > x+speed) {
            horizontalSpeed = -1 * speed;
        } else if (ship.x < x-speed) {
            horizontalSpeed = 1 * speed;
        } else {
            horizontalSpeed = 0;
        }
        if(ship.y > y+speed) {
            verticalSpeed = -1 * speed;
        } else if(ship.y < y - speed) {
            verticalSpeed = 1 * speed;
        } else {
            verticalSpeed = 0;
        }
        ship.x += horizontalSpeed;
        ship.y += verticalSpeed;
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

function getRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



