var app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
// inits
document.onmousemove = mouse_position;

document.onmousedown = fire;
var lastTime = 0,
    meteors = [],
    clouds = [],
    bullets = [],
    ship,
    x, // x координата указателя
    y, // y координата указателя
    body = document.querySelector("body"),
    lastShoot = 0;

/*
 * Сохраняем координаты указателя мыши
 */
function mouse_position(e) {
    x = e.x;
    y = e.y;
}

// Стиль для кнопки START
var style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 36,
    fontStyle: 'Bold',
    fill: '#FFF'
});

// Создаем кнопку START
var startButton = new PIXI.Text('START', style);
startButton.anchor.set(0.5);
startButton.x = app.renderer.width / 2;
startButton.y = app.renderer.height / 2;
startButton.interactive = true;
startButton.buttonMode = true;
startButton.on('pointerdown', onClickToStartButton);
app.stage.addChild(startButton);

/*
 * Обработчик нажатия кнопки START
 */

function onClickToStartButton() {
    app.stage.removeChild(startButton);
    body.style.cssText = "cursor: move";// Изменяем курсор
    startTheGame();
}

function startTheGame() {
    // Создаем корабль игрока
    ship = PIXI.Sprite.fromImage('sprites/ship.png');
    ship.anchor.set(0.5);
    ship.x = app.renderer.width / 2;
    ship.y = app.renderer.height / 2;
    ship.width = 40;
    ship.height = 110;

    app.stage.addChild(ship);
    ////
    var cloudContainer = new PIXI.Container();
    cloudContainer.zIndex = 0;

    app.stage.addChild(cloudContainer);

    app.ticker.add(function() {
        let d = new Date();


        if (d.getTime()-lastTime >= 1000) {
            lastTime = d.getTime();
            // Создаем облака каждую секунду
            let cloud = PIXI.Sprite.fromImage('sprites/cloud.png');
            cloud.anchor.set(0.5);
            cloud.x = getRand(10, app.renderer.width - 10);
            cloud.y = -200;
            cloud.rotation = getRand(1,8);
            let scale = 0.7 * getRand(2,5);
            cloud.verticalSpeed = (5 + getRand(1,5)) / 10;
            cloud.scale.x *= scale;
            cloud.scale.y *= scale;
            clouds.push(cloud);
            app.stage.addChild(cloud);
            // Создаем метеоры каждую секунду
            let meteor = PIXI.Sprite.fromImage('sprites/meteor.png');
            meteor.anchor.set(0.5);
            meteor.x = getRand(10, app.renderer.width - 10);
            meteor.y = -400;
            meteor.scaleArg = getRand(-5, 5) / 200;
            meteor.scale.x *= 0.1;
            meteor.scale.y *= 0.1;
            //meteor.zOrder = 210;
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

        // Двигаем облака
        clouds.forEach(function (cloud, i) {
            cloud.y += cloud.verticalSpeed;
            // Удаляем облака, вылетевшие за экран
            if(cloud.y > app.renderer.height + 300) {
                app.stage.removeChild(cloud);
                clouds.splice(i, 1);
            }
        });

        // Двигаем выстрелы
        bullets.forEach(function (bullet, i) {
            bullet.y -= bullet.verticalSpeed;
            // Удаляем облака, вылетевшие за экран
            if(bullet.y < -10) {
                app.stage.removeChild(bullet);
                bullets.splice(i, 1);
            }
        });

        // Двигаем корабль
        ship.x += (x - ship.x) * 0.02;
        ship.y += (y - ship.y) * 0.02;

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

function fire(e) {
    let d = new Date();
    if(d.getTime() - lastShoot > 1000) {
        let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
        bullet.anchor.set(0.5);
        bullet.width = 20;
        bullet.height = 20;
        bullet.x = ship.x;
        bullet.y = ship.y - 40;
        bullet.verticalSpeed = 1;
        bullets.push(bullet);
        app.stage.addChild(bullet);
        lastShoot = d.getTime();
    }
}



