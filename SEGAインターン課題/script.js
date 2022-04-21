"use strict";
// Copyright(C) SEGA

// 必要事項記入欄
// マイナビID：s21m1043
// 氏名：中島 美生
// コメント(工夫した点など)
// ：当たってしまったらゲームオーバーなので、ボールを赤い色にしました。
// ：
// ：

// 本体コード
const PROJECT_NAME = "Avoid the ball!"; // このゲームの名前

// 画面情報
const WINDOW_WIDTH = 640; // 画面の横幅
const WINDOW_HEIGHT = 480; // 画面の縦幅

// 弾の情報
const NUM_BULLET = 200; // 制御する弾丸の数
const SIZE_BULLET = 32; // 弾丸の当たり判定の大きさ
const SEC_RESPAWN_BULLET = 20; // 弾丸再初期化までの時間

const deltaTime = 1.0 / 60.0; // 経過時間

// グローバル変数

let player; // プレイヤー制御
let input; // 入力制御
let grp_bullet; // 弾丸制御
const bullets = []; // 弾丸制御
let bg; // 背景制御
let sequence; // シーケンス制御
let canvas;

// プレイヤーのクラス
class CPlayer {
    constructor() {
        // プレイヤーのパラメータ
        this.x = 0.0;
        this.y = 0.0;
        this.speed = 1.0;

        // 表示用パラメータ
        this.object = new createjs.Shape(); // プレイヤーの表示オブジェクト登録
        this.object.graphics.beginFill("#d8bfd8");
        this.object.graphics.drawCircle(0, 0, 32);
        this.object.x = 0;
        this.object.y = -WINDOW_HEIGHT; // 画面に映らない位置で生成する
        canvas.addChild(this.object);
    }
    update() {
        // キー入力によるプレイヤーの移動(input.[up,down,left,right])
        if (input.left) { this.x -= this.speed; }
        if (input.right) { this.x += this.speed; }
        if (input.up) { this.y -= this.speed; }
        if (input.down) { this.y += this.speed; }
        // 他のキーは未実装

        // 表示オブジェクトへの位置の反映
        this.object.x = this.x;
        this.object.y = this.y;
    }
    initialize() {
        this.x = WINDOW_WIDTH * 0.5;
        this.y = WINDOW_HEIGHT * 1.0;
    }
}

// 弾のクラス
class CBullet {
    constructor() {
        // 弾のパラメータ
        this.x = 0.0;
        this.y = 0.0;
        this.vx = 0.0;
        this.vy = 0.0;
        this.speed = 0.0;
        this.timer = 0.0;
        this.delay = 0.0;

        // 表示用パラメータ
        this.object = new createjs.Shape(); // 弾の表示オブジェクト登録
        this.object.graphics.beginFill("#ff6347");
        this.object.graphics.drawCircle(0, 0, 8);
        this.object.x = 0;
        this.object.y = -WINDOW_HEIGHT; // 画面に映らない位置で生成する
        canvas.addChild(this.object);
    }
    update() {
        // 動き出すまでのディレイ処理
        if (this.timer >= this.delay) {
            this.x += this.vx * this.speed;
            this.y += this.vy * this.speed;
        }
        // 時間経過で初期位置に戻る
        if (this.timer >= SEC_RESPAWN_BULLET) {
            this.x = WINDOW_WIDTH * 0.5;
            this.y = WINDOW_HEIGHT * 0.0;
            this.timer = 0;
        }
        // deltaTimeを積算する
        this.timer += deltaTime;

        // 表示オブジェクトへの位置の反映
        this.object.x = this.x;
        this.object.y = this.y;
    }
    initialize(x, y, vx, vy, speed, delay) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = speed;
        this.delay = delay;
        this.timer = 0.0;
    }
}

// 弾全体を制御するクラス
class CBulletGroup {
    constructor() {
        // 弾丸の初期化
        for (let i = 0; i < NUM_BULLET; i++) {
            bullets[i] = new CBullet();
        }
    }
    initialize() { // 初期化
        // 弾の挙動を変える場合は下記と、CBulletのupdateを変更する
        for (let i = 0; i < NUM_BULLET; i++) {
            const dx = (42 + (i * 5) % 90) * Math.PI / 180.0; // 弾の角度をラジアンに変換
            const dy = Math.cos(Math.PI/6); // 弾の角度をラジアンに変換
            bullets[i].initialize(WINDOW_WIDTH * 0.5, WINDOW_HEIGHT * 0.0, Math.cos(dx), Math.sin(dy), 2.0, i * 0.1);
        }
    }
    update() { // 全ての弾の更新
        for (let i = 0; i < NUM_BULLET; i++) {
            bullets[i].update();
        }
    }
    isHit(x, y, r) { // プレイヤーとの判定
        let ret = false;
        for (let i = 0; i < NUM_BULLET; i++) {
            const dx = x - bullets[i].x;
            const dy = y - bullets[i].y;
            const d = dx * dx + dy * dy; // 弾とプレイヤーの距離で判定
            if (d < r) {
                ret = true;
                break;
            }
        }
        return ret;
    }
}

// 背景を制御するクラス
class CBackGround {
    constructor() {
        // 表示用パラメータ
        this.object = new createjs.Shape(); // 最背面の黒い板を表示
        this.object.graphics.beginFill("#000000");
        this.object.graphics.drawRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        canvas.addChild(this.object);

        // 追加で背景オブジェクトを追加する場合は、以下に記載する
    }
    update() {
        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffacd");
        this.object.graphics.drawCircle(0, 0, 2);
        this.object.x = 30;
        this.object.y = 100; 
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffafa");
        this.object.graphics.drawCircle(0, 0, 3);
        this.object.x = 90;
        this.object.y = 130;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffafa");
        this.object.graphics.drawCircle(0, 0, 3);
        this.object.x = 500;
        this.object.y = 200;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffafa");
        this.object.graphics.drawCircle(0, 0, 2);
        this.object.x = 250;
        this.object.y = 250;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#ffc0cb");
        this.object.graphics.drawCircle(0, 0, 3);
        this.object.x = 300;
        this.object.y = 300;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffafa");
        this.object.graphics.drawCircle(0, 0, 3);
        this.object.x = 60;
        this.object.y = 400;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffafa");
        this.object.graphics.drawCircle(0, 0, 2);
        this.object.x = 270;
        this.object.y = 30;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#add8e6");
        this.object.graphics.drawCircle(0, 0, 3);
        this.object.x = 400;
        this.object.y = 190;
        canvas.addChild(this.object);

        this.object = new createjs.Shape();
        this.object.graphics.beginFill("#fffafa");
        this.object.graphics.drawCircle(0, 0, 2);
        this.object.x = 550;
        this.object.y = 270;
        canvas.addChild(this.object);
        // 必要に応じて、背景オブジェクトのパラメータの変更などをおこなう
    }
}


// ---------------------------------------------------------------------------------------------
// 以下のコードはインターン課題では変更・追加の必要がありません。
// ゲームをより良くするために改変する場合は、バックアップをとって改変してください。
// ---------------------------------------------------------------------------------------------

function setup() {
    // キャンバスを作成
    canvas = new createjs.Stage("myCanvas");

    // なにかキーが押されたとき、keydownfuncという関数を呼び出す
    window.addEventListener("keydown", keydownfunc);
    window.addEventListener("keyup", keyupfunc);

    // 背景の生成
    bg = new CBackGround();

    // プレイヤー生成
    player = new CPlayer();

    // 入力システム生成
    input = new CInput();

    // 弾丸の生成
    grp_bullet = new CBulletGroup();

    // シーケンスの生成
    sequence = new CSequence();

    // tickをまわす
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.addEventListener("tick", handleTick);
}

// 時間経過
function handleTick() {
    // システム系更新
    sequence.update();

    // 画面更新
    canvas.update();
}

// 入力のクラス
class CInput {
    constructor() {
        this.up = 0; this.down = 0; this.left = 0; this.right = 0; this.space = 0;
    }
}

// キーが押されたときに呼び出される関数
function keydownfunc(event) {
    const key_code = event.keyCode;
    if (key_code === 32) { input.space = true; }
    if (key_code === 37) { input.left = true; }
    if (key_code === 38) { input.up = true; }
    if (key_code === 39) { input.right = true; }
    if (key_code === 40) { input.down = true; }
}

// キーが戻されたときに呼び出される関数
function keyupfunc(event) {
    const key_code = event.keyCode;
    if (key_code === 32) { input.space = false; }
    if (key_code === 37) { input.left = false; }
    if (key_code === 38) { input.up = false; }
    if (key_code === 39) { input.right = false; }
    if (key_code === 40) { input.down = false; }
}

// シーケンスを制御するクラス
class CSequence {
    constructor() {
        this.score = 0;
        this.timer = 0.0;
        this.modename = "seq_title";

        // ゲームの名前
        this.tex_line0 = new createjs.Text(PROJECT_NAME, "16px serif", "White");
        this.tex_line0.textAlign = "left";
        this.tex_line0.x = 8;
        this.tex_line0.y = 8;
        canvas.addChild(this.tex_line0);

        // 操作
        this.tex_line1 = new createjs.Text("PRESS SPACE", "16px serif", "White")
        this.tex_line1.textAlign = "center";
        this.tex_line1.x = WINDOW_WIDTH * 0.5;
        this.tex_line1.y = WINDOW_HEIGHT * 0.5;
        canvas.addChild(this.tex_line1);

        // スコア
        this.tex_score = new createjs.Text("", "16px serif", "White")
        this.tex_score.textAlign = "left";
        this.tex_score.x = 8;
        this.tex_score.y = 8 + 16;
        canvas.addChild(this.tex_score);
    }
    update() {
        this.timer += deltaTime;
        switch (this.modename) {
            case "seq_title": // タイトル画面
                if (input.space) { // スペースキーが押されたら、ゲーム画面に移動
                    // プレイヤーの初期化をする
                    player.initialize();
                    // 弾丸の初期化をする
                    grp_bullet.initialize();
                    this.score = 0;
                    this.modename = "seq_game";
                    this.timer = 0.0;
                    this.tex_line1.text = "";
                }
                break;
            case "seq_game": // ゲーム中
                this.score += 1;
                // 弾丸の更新
                grp_bullet.update();
                // プレイヤーの更新
                player.update();
                // 背景の更新
                bg.update();
                if (grp_bullet.isHit(player.x, player.y, SIZE_BULLET)) { // 弾に当たったら、結果表示に移動
                    this.modename = "seq_result";
                    this.timer = 0.0;
                    this.tex_line1.text = "PRESS SPACE";
                }
                break;
            case "seq_result": // 結果表示
                if (input.space) { // スペースキーが押されたら、タイトル画面に移動
                    this.modename = "seq_title";
                    this.timer = 0.0;
                    grp_bullet.initialize();
                }
                break;
        }

        // スコアの表示用に文字列書き換え
        this.tex_score.text = "SCORE:" + this.score;
    }
}
