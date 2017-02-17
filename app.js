"use strict";

let app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});

document.body.appendChild(app.view);
document.onmousemove = mouse_position;
document.onmousedown = fire;
document.onkeydown = key;

/*
 * Класс статистики
 */

class Statistic {
    constructor() {
        this.money = 0;
        this.drawMoney();

    }

    /*
     * Добавление денег
     * @param Integer arg - количество денег
     */

    addMoney(arg) {
        this.money += arg;
        this.moneyView.text = "Деньги: " + this.money;
    }

    /*
     * Отрисовка количества денег
     */

    drawMoney() {
        var style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 12,
            fill: '#FFF'
        });
        this.moneyView = new PIXI.Text('', style);
        this.addMoney(0);
        this.moneyView.anchor.set(0.5);
        this.moneyView.x = 40;
        this.moneyView.y = app.renderer.height - 10;
        app.stage.addChild(this.moneyView);
    }

    /*
     * Очищаем всю статистику
     */

    clear() {
        this.addMoney(-1 * this.money);
    }
}

let meteors = [], // Массив с метеорами
    clouds = [], // Массив с облаками
    bullets = [], // Массив с выпущенными ракетами
    ship, // Ссылка на объект корабля
    x, // x координата указателя
    y, // y координата указателя
    body = document.querySelector("body"),
    lastShoot = 0, // Хранит время последнего выстрела
    intervalID = [], // Массив с идентификаторами всех setInterval'ов
    stats = new Statistic();

startButton();
upgareButton();

/*
 * Сохраняем координаты указателя мыши
 */

function mouse_position(e) {
    if (document.attachEvent != null) {
        x = window.event.clientX;
        y = window.event.clientY;
    } else if (!document.attachEvent && document.addEventListener) {
        x = event.clientX;
        y = event.clientY;
    }
}

function startTheGame() {
    start();

    app.ticker.add(function() {

        // Крутим метеоры
        meteors.forEach(function (meteor, i) {
            meteor.rotation += meteor.scaleArg;
            meteor.y += meteor.verticalSpeed;
            meteor.x += meteor.horizontalSpeed;
            if(ship.isHit(meteor.x, meteor.y)) {
                app.stage.removeChild(ship);
                gameOver();
            }

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
            bullet.x += bullet.horizontalSpeed;
            // Попали ли по метеору
            meteors.forEach(function (meteor, i) {
                if(meteor.isHit(bullet.x, bullet.y)) {
                    app.stage.removeChild(meteor);
                    meteors.splice(i, 1);
                    bullet.y = -11;
                    stats.addMoney(1);
                }
            });
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

/*
 * Получение случайного числа
 */

function getRand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
 * Обработчик выстрела
 */

function fire(e) {
    if(ship) {
        let d = new Date();
        if(d.getTime() - lastShoot > 1200) {
            let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
            bullet.anchor.set(0.5);
            bullet.width = 20;
            bullet.height = 20;
            bullet.x = ship.x;
            bullet.y = ship.y - 40;
            bullet.verticalSpeed = 0.8;
            bullet.horizontalSpeed = 0;
            bullets.push(bullet);
            app.stage.addChild(bullet);
            if(ship.weaponLevel > 0) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 20;
                bullet.height = 20;
                bullet.rotation = -0.5;
                bullet.horizontalSpeed = -1 * 0.2;
                bullet.x = ship.x - 10;
                bullet.y = ship.y;
                bullet.verticalSpeed = 0.4;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }
            if(ship.weaponLevel > 1) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 20;
                bullet.height = 20;
                bullet.rotation = 0.5;
                bullet.horizontalSpeed = 0.2;
                bullet.x = ship.x + 10;
                bullet.y = ship.y;
                bullet.verticalSpeed = 0.4;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }
            lastShoot = d.getTime();
        }
    }
}

/*
 * Создание объекта с кораблем игрока
 */

function createShip() {
    ship = PIXI.Sprite.fromImage('sprites/ship.png');
    ship.anchor.set(0.5);
    ship.x = app.renderer.width / 2;
    ship.y = app.renderer.height / 2;
    ship.width = 40;
    ship.height = 110;
    ship.isHit = isHit;
    ship.coins = 0;
    ship.weaponLevel = 0;
    app.stage.addChild(ship);
}

/*
 * Создание облака
 */

function createCloud() {
    let cloud = PIXI.Sprite.fromImage('sprites/cloud.png');
    let scale = 0.7 * getRand(2,5);

    cloud.anchor.set(0.5);
    cloud.x = getRand(10, app.renderer.width - 10);
    cloud.y = -200;
    cloud.rotation = getRand(1,8);
    cloud.scale.x *= scale;
    cloud.scale.y *= scale;
    cloud.verticalSpeed = (5 + scale) / 10;
    clouds.push(cloud);
    app.stage.addChild(cloud);
}

/*
 * Создание метеора
 */

function createMeteor() {
    let meteor = PIXI.Sprite.fromImage('sprites/meteor.png');
    meteor.anchor.set(0.5);
    meteor.x = getRand(-10, app.renderer.width +10);
    meteor.y = -400;
    meteor.scaleArg = getRand(-5, 5) / 200;
    if(meteor.x > app.renderer.width/2) {
        meteor.horizontalSpeed = -1*getRand(0,10)/20;
    } else {
        meteor.horizontalSpeed = getRand(0,10)/20;
    }
    meteor.verticalSpeed = getRand(1,30)/10;
    meteor.scale.x *= 0.1;
    meteor.scale.y *= 0.1;
    meteor.isHit = isHit;
    meteors.push(meteor);
    app.stage.addChild(meteor);
}

/*
 * Проверка столкновений
 */

function isHit(corx, cory) {
    if( (corx < this.x+this.width/2) && (corx > this.x-this.width/2) ) {
        if( (cory < this.y+this.height/2) && (cory > this.y - this.height/2) ) {
            return true;
        }
    }
    return false;
}

/*
 * Проигрыш
 */

function gameOver() {
    intervalID.forEach(function (interval) {
        clearInterval(interval);
    });
    meteors.forEach(function (meteor) {
        app.stage.removeChild(meteor);
    });
    meteors = [];
    stats.clear();
    startButton();
}

/*
 * Рестарт
 */

function start() {
    createShip();
    intervalID.push(setInterval(createMeteor, 500));
    intervalID.push(setInterval(createCloud, 1000));
}

/*
 * Кнопка старт
 */

function startButton() {
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
    if(ship) startButton.text = "Game over! \n\n\n RESTART";
    app.stage.addChild(startButton);

    /*
     * Обработчик нажатия кнопки START
     */

    function onClickToStartButton() {
        app.stage.removeChild(startButton);
        body.style.cssText = "cursor: move";// Изменяем курсор
        if(ship) {
            start();
        } else {
            startTheGame();
        }
    }
}

function upgareButton() {
    var style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 12,
        fill: '#000'
    });
    var startButton = new PIXI.Text('Upgrade weapons (10 coins)', style);
    startButton.anchor.set(0.5);
    startButton.x = app.renderer.width / 2;
    startButton.y = app.renderer.height - 10;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on('pointerdown', onClickToStartButton);
    app.stage.addChild(startButton);

    function onClickToStartButton() {
        if(stats.money > ship.weaponLevel*10 + 10) {
            ship.weaponLevel += 1;
            stats.addMoney(-10);
        }
    }
}

function upgradeWeapon() {
    let cost = ship.weaponLevel*10 + 10;
    if(stats.money > cost) {
        stats.addMoney(-cost);
        ship.weaponLevel += 1;
    }
}

function key(e) {
    if(event.keyCode == 49) {
        upgradeWeapon();
    }
}
