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
        this.health = 100;
        this.shipLevel = 1;
        this.weaponLevel = 1;
        this.level = 0;

        this.style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#000'
        });
        this.moneyView = new PIXI.Text('', this.style);
        this.moneyView.x = 10;
        this.moneyView.y = 20;
        app.stage.addChild(this.moneyView);

        this.drawStat();
    }

    /*
     * Добавление денег
     * @param Integer arg - количество денег
     */

    addMoney(arg) {
        this.money += arg;
        this.drawStat();
    }

    addHealth(arg) {
        this.health += arg;
        this.drawStat();
    }

    getCostOfNewUpgrade() {
        return this.weaponLevel*this.weaponLevel*30;
    }

    getCostOfNewUpgradeShip() {
        return this.shipLevel*this.shipLevel*30;
    }

    upgradeWeapon() {
        let cost = this.getCostOfNewUpgrade();
        if(this.money > cost) {
            this.addMoney(-cost);
            this.weaponLevel += 1;
        }
        this.drawStat();
    }

    upgradeShip() {
        let cost = this.getCostOfNewUpgradeShip();
        if(stats.money > cost) {
            stats.addMoney(-cost);
            this.shipLevel += 1;
        }
        this.drawStat();
    }

    upgradeAllWeapon(){
        this.weaponLevel += 10;
        this.drawStat();
    }

    upgradeAllShip(){
        this.shipLevel += 10;
        this.drawStat();
    }

    /*
     * Отрисовка количества денег
     */

    drawStat() {
        this.moneyView.text =
            "---УЛУЧШЕНИЯ---" +
            "\nОружие: " + this.getCostOfNewUpgrade() + " (Нажмите 1)" +
            "\nКорабль: " + this.getCostOfNewUpgradeShip() + " (Нажмите 2)" +
            "\n\n---ИГРОК---" +
            "\nДеньги: " + Math.floor(this.money) +
            "\nЗдоровье:" + Math.floor(this.health) + "/" + this.shipLevel*100;
    }

    healShip() {
        this.level += 0.07;
        if(this.health >= this.shipLevel*100) {
            this.health = this.shipLevel*100;
        } else {
            this.addHealth(this.shipLevel*3);
        }
    }

    /*
     * Очищаем всю статистику
     */

    clear() {
        this.money = 0;
        this.health = 100;
        this.shipLevel = 1;
        this.weaponLevel = 1;
        this.level = 1;
        this.money = 0;
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
    stats = new Statistic(),
    startButton,
    interfaceLabel;

showStartButton();
showInterface();

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
                stats.addHealth(-meteor.health);
                stats.addMoney(meteor.width/7);
                app.stage.removeChild(meteor);
                meteors.splice(i, 1);
                if(stats.health <= 0) {
                    app.stage.removeChild(ship);
                    gameOver();
                }
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
            bullet.verticalSpeed += bullet.a * bullet.verticalSpeed * bullet.verticalSpeed / 300 + 0.01;
            // Попали ли по метеору
            meteors.forEach(function (meteor, i) {
                if(meteor.isHit(bullet.x, bullet.y)) {
                    meteor.health -= bullet.damage;
                    bullet.y = -11; // Уничтожаем пулю
                    if(meteor.health <= 0) {
                        stats.addMoney(meteor.width/4);
                        app.stage.removeChild(meteor);
                        meteors.splice(i, 1);
                    }
                }
            });
            // Удаляем облака, вылетевшие за экран
            if(bullet.y < -10) {
                app.stage.removeChild(bullet);
                bullets.splice(i, 1);
            }
        });

        // Двигаем корабль
        ship.x += (x - ship.x) * ( (stats.shipLevel/10+1) / 100 );
        ship.y += (y - ship.y) * ( (stats.shipLevel/10+1) / 100 );

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
        if(d.getTime() - lastShoot > 800 - (stats.weaponLevel*15)) {

            let horizontalSpeedLeftAndRightWeapon = 0.4;

            if(stats.weaponLevel > 0) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 20;
                bullet.height = 20;
                bullet.x = ship.x;
                bullet.y = ship.y;
                bullet.horizontalSpeed = 0.02;
                bullet.verticalSpeed = 1;
                bullet.a = 1.005;
                bullet.damage = bullet.width+bullet.height;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 1) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 15;
                bullet.height = 15;
                bullet.x = ship.x-15;
                bullet.y = ship.y - 30;
                bullet.verticalSpeed = 0.3;
                bullet.horizontalSpeed = 0;
                bullet.a = 1; // Ускорение
                bullet.damage = bullet.width+bullet.height;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 2) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 15;
                bullet.height = 15;
                bullet.x = ship.x+15;
                bullet.y = ship.y - 30;
                bullet.verticalSpeed = 0.3;
                bullet.horizontalSpeed = 0;
                bullet.damage = bullet.width+bullet.height;
                bullet.a = 1.01; // Ускорение
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 3) {
                let bullet = PIXI.Sprite.fromImage('sprites/smallrocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 10;
                bullet.height = 10;
                bullet.horizontalSpeed = -horizontalSpeedLeftAndRightWeapon*2;
                bullet.x = ship.x - 10;
                bullet.y = ship.y;
                bullet.verticalSpeed = 0.02;
                bullet.a = 1.04;
                bullet.damage = bullet.width+bullet.height+30;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }
            if(stats.weaponLevel > 4) {
                let bullet = PIXI.Sprite.fromImage('sprites/smallrocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 10;
                bullet.height = 10;
                bullet.horizontalSpeed = +horizontalSpeedLeftAndRightWeapon*2;
                bullet.x = ship.x + 10;
                bullet.y = ship.y;
                bullet.verticalSpeed = 0.02;
                bullet.a = 1.04;
                bullet.damage = bullet.width+bullet.height + 30;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 5) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 20;
                bullet.height = 20;
                bullet.horizontalSpeed = horizontalSpeedLeftAndRightWeapon;
                bullet.x = ship.x + 10;
                bullet.y = ship.y;
                bullet.verticalSpeed = -2;
                bullet.a = 1.01;
                bullet.damage = bullet.width+bullet.height;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 6) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 20;
                bullet.height = 20;
                bullet.horizontalSpeed = -horizontalSpeedLeftAndRightWeapon;
                bullet.x = ship.x - 10;
                bullet.y = ship.y;
                bullet.verticalSpeed = -2;
                bullet.a = 1.01;
                bullet.damage = bullet.width+bullet.height;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 7) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 15;
                bullet.height = 15;
                bullet.horizontalSpeed = -horizontalSpeedLeftAndRightWeapon*3;
                bullet.x = ship.x - 10;
                bullet.y = ship.y+20;
                bullet.verticalSpeed = -1;
                bullet.a = 1.02;
                bullet.damage = bullet.width+bullet.height+30;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 8) {
                let bullet = PIXI.Sprite.fromImage('sprites/rocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 15;
                bullet.height = 15;
                bullet.horizontalSpeed = horizontalSpeedLeftAndRightWeapon*3;
                bullet.x = ship.x + 10;
                bullet.y = ship.y+20;
                bullet.verticalSpeed = - 1;
                bullet.a = 1.02;
                bullet.damage = bullet.width+bullet.height+30;
                bullets.push(bullet);
                app.stage.addChild(bullet);
            }

            if(stats.weaponLevel > 9) {
                let bullet = PIXI.Sprite.fromImage('sprites/smallrocket.png');
                bullet.anchor.set(0.5);
                bullet.width = 30;
                bullet.height = 30;
                bullet.horizontalSpeed = 0;
                bullet.x = ship.x;
                bullet.y = ship.y;
                bullet.verticalSpeed = -1;
                bullet.a = 1.005;
                bullet.damage = bullet.width+bullet.height;
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
    ship.health = 100;
    ship.shipLevel = 1;
    ship.weaponLevel = 1;
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
    for(let i = 0; i < stats.level; i++) {
        let meteor = PIXI.Sprite.fromImage('sprites/meteor.png');
        meteor.anchor.set(0.5);
        meteor.x = getRand(-50, app.renderer.width +50);
        meteor.y = -400;
        meteor.scaleArg = getRand(-5, 5) / 200;
        if(meteor.x > app.renderer.width/2) {
            meteor.horizontalSpeed = -1*getRand(0,25)/20;
        } else {
            meteor.horizontalSpeed = getRand(0,25)/20;
        }
        meteor.verticalSpeed = getRand(10+stats.level,10+stats.level*3)/10;
        meteor.width = 30/meteor.verticalSpeed + 20 + stats.level;
        meteor.height = 25/meteor.verticalSpeed + 20 + stats.level;
        //meteor.scale.x *= 0.1;
        //meteor.scale.y *= 0.1;
        meteor.isHit = isHit;
        meteor.health = meteor.width*meteor.height/50;
        console.log(meteor.health);
        meteors.push(meteor);
        app.stage.addChild(meteor);
    }


    stats.healShip();
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
    showStartButton();
}

/*
 * Рестарт
 */

function start() {
    createShip();
    intervalID.push(setInterval(createMeteor, 3000));
    intervalID.push(setInterval(createCloud, 2000));
}

/*
 * Кнопка старт
 */

function showStartButton() {
    // Стиль для кнопки START
    let style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'Bold',
        fill: '#FFF'
    });

    // Создаем кнопку START
    startButton = new PIXI.Text('START', style);
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

function showInterface() {
    let style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 16,
        fill: '#FFF'
    });
    interfaceLabel = new PIXI.Text('', style);
    interfaceLabel.anchor.set(0.5);
    interfaceLabel.x = app.renderer.width / 2;
    interfaceLabel.y = app.renderer.height - 10;
    app.stage.addChild(interfaceLabel);
}

function key(e) {
    if(event.keyCode == 49) {
        stats.upgradeWeapon();
    }

    if(event.keyCode == 50) {
        stats.upgradeShip();
    }

    if(event.keyCode == 55) {
        stats.upgradeAllWeapon();
        stats.upgradeAllShip();
    }
}
