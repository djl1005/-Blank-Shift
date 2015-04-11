

var app = app || {};
    "use strict";

window.onload = function () {


    app.game = new Phaser.Game(300, 350, Phaser.CANVAS, "", { preload: onPreload, create: onCreate, update: onUpdate });

    app.oldX = 0;
    app.oldY = 0;
    app.currentX = 0;
    app.currentY = 0;
    app.dragging = false;
    app.isHorizontal = false;
    app.isVertical = false;
    app.oldRow = 0;
    app.oldCol = 0;
    app.startCol = 0;
    app.startRow = 0;
    app.currentRow = 0;
    app.currentCol = 0;

    app.timer;

    var tileSize = 50;				// tile size, in pixels
    var fieldSize = 6;     			// number of tiles per row/column
    var tileTypes = 9;				// different kind of tiles allowed
    var pickedZoom = 1.1;              // zoom ratio to highlight picked tile
    var score = 0;

    var tileArray = [];				// array with all game tiles
    var tileGroup; 				// group containing all tiles
    var movingTileGroup;               // group containing the moving tile
	
	var scoreText = null;	//Text for the player's score
	var moves = null;
	var moveText = null;	//Text for the player's remaining moves
	var uiShift = 50;		//Pixels to shift the board down by

    function onPreload() {
        app.game.load.spritesheet("tiles", "media/tiles.png", 100, 100);
        app.timer = new Phaser.Timer(app.game, false);

        app.timer.add(250, repopulate);
    }

    function onCreate() {
        // show the game in full screen
        app.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        app.game.scale.setScreenSize();
		app.game.stage.backgroundColor = '#8E669A';
        // add groups. movingTileGroup needs to be above tileGroup so moving tiles
        // will always have an higher z index and will always stay on top of the game
        tileGroup = app.game.add.group();
        movingTileGroup = app.game.add.group();
        // game field generation, all tiles initially added to "tileGroup" tile
        for (var i = 0; i < fieldSize; i++) {
            tileArray[i] = [];
            for (var j = 0; j < fieldSize; j++) {
                var randomTile = Math.floor(Math.random() * (tileTypes - 1));
                var theTile = app.game.add.sprite(((fieldSize - 1) - j) * tileSize + tileSize / 2, ((fieldSize - 1) - i) * tileSize + tileSize / 2 + uiShift, "tiles");
				theTile.scale.x = 0.5;
				theTile.scale.y = 0.5;
                theTile.frame = randomTile || 0;
                theTile.type = randomTile || 0;
                theTile.LRactive = true;
                theTile.TDactive = true;

                /*
                // here to test  sort
                if (i == 0 || i == 1)
                {
                    theTile.active = false;
                    theTile.frame = 5;
                }
                */
                
                theTile.col = i;
                theTile.anchor.setTo(0.5, 0.5);
                tileArray[i][j] = theTile;
                tileGroup.add(theTile);
            }
        }

		scoreText = app.game.add.text(app.game.world.centerX + 10, 10, "Score : 0", {font: '25px Arial', fill: '#fff'});
		moves = 100;
		moveText = app.game.add.text(10, 10, "Moves :" + moves, { font: '25px Arial', fill: '#fff' });
        
        //Make sure there are no matches on spawn
		doMatchCheck();
		score = 0;

        //app.game.input.onDown.add(pickTile, this);
        app.game.input.onDown.add(startSwipe, this);
    }


    function onUpdate() {
        // if we are dragging a tile
        if (app.dragging) {
            //Save end coordinates
            app.currentX = app.game.input.worldX;
            app.currentY = app.game.input.worldY;

            //Determine distance travelled in the X and Y
            var xDist = app.oldX - app.currentX;
            var yDist = app.oldY - app.currentY;
            var moveTiles = [];

            //A Horizontal swipe takes place when xDist is at least twice yDist and at least 10 world units
            // see veritical block for more details
            if (app.oldY > uiShift && Math.abs(xDist) > Math.abs(yDist) * 2 && Math.abs(xDist) > 10 && !app.isVertical) {
                //Copy the row
                moveTiles = tileArray[app.oldRow].slice(0);

                app.isHorizontal = true;

                app.currentCol = Math.floor((app.game.world.width - app.currentX) / tileSize);

                var dist = app.currentCol - app.oldCol;

                for (var i = 0; i < fieldSize; i++) {

                    var index = i + dist;

                    if (index >= fieldSize) {
                        index = index - fieldSize;
                    }
                    if (index < 0) {
                        index = index + fieldSize;
                    }

                    tileArray[app.oldRow][index] = moveTiles[i];
                    tileArray[app.oldRow][index].x = (((fieldSize - 1)) - index) * tileSize + tileSize / 2;

                }
                app.oldCol = app.currentCol;
                app.oldX = app.currentX;
				
            } // end horizontal

            //A Vertical swipe takes place when yDist is at least twice xDist and at least 10 world units
            if (app.oldY > uiShift && Math.abs(yDist) > Math.abs(xDist) * 2 && Math.abs(yDist) > 10 && !app.isHorizontal) {
                //Copy the col
                for (var i = 0; i < fieldSize; i++) {
                    moveTiles.push(tileArray[i][app.oldCol]);
                }
                app.isVertical = true;

                //caluclate which row the mouse is curently in
                app.currentRow = Math.floor((app.game.world.height - app.currentY) / tileSize);

                var dist = app.currentRow - app.oldRow;

                for (var i = 0; i < fieldSize; i++) {

                    var index = i + dist;

                    //if the new row index of the sqare is in
                    if (index >= fieldSize) {
                        index = index - fieldSize;
                    }
                    if (index < 0) {
                        index = index + fieldSize;
                    }

                    //move it in the array
                    tileArray[index][app.oldCol] = moveTiles[i];
                    //move it's position
                    tileArray[index][app.oldCol].y = (((fieldSize - 1)) - index) * tileSize + tileSize / 2 + uiShift;


                }
                app.oldRow = app.currentRow;
                app.oldY = app.currentY;
            }

        }
    }

    function doMatchCheck() {

        var changed = false;

        console.log("boop");

        for (var i = 0; i < fieldSize; i++) {
            for (var j = 0; j < fieldSize; j++) {

                var leftRight = checkLeftRight(i, j, tileArray[i][j].frame);
                var topDown = checkTopDown(i, j, tileArray[i][j].frame);

                //console.log("i:" + i + " j:" + j + " frame:" + tileArray[i][j].frame);

                if (leftRight > 2 && tileArray[i][j].LRactive) {
                    for (var k = 0; k < leftRight; k++) {
                        tileArray[i][j + k].LRactive = false;

                        if (tileArray[i][j].frame == 8) {
                            move += leftRight - 1;
                        } else {
                            score += leftRight;
                        }

                        changed = true;
                        localChange = true;
                    }
                }

                if ( topDown > 2 && tileArray[i][j].TDactive) {
                    for (var k = 0; k < topDown; k++) {
                        tileArray[i + k][j].TDactive = false;

                        if (tileArray[i][j].frame == 8) {
                            move += topDown - 1;
                        } else {
                            score += topDown;
                        }

                        changed = true;
                        localChange = true;
                    }
                }

            }
        }

        if (changed)
        {
            sort(changed);
        }
        
        //repopulate();
    }

    //checks for a left to right match: index 1 is y index in array, index 2 is x, color is type of match
    function checkLeftRight(index1, index2, color) {
        var num = 0;
        for (var i = index2; i < fieldSize; i++) {
            
            if ((tileArray[index1][i].frame == color) && tileArray[index1][i].LRactive) {
                num++;
            } else {
                break;
            }
        }

        return num;
    }

    //checks for a bottom to top match: index 1 is y index in array, index 2 is x, color is type of match
    function checkTopDown(index1, index2, color) {
        var num = 0;

        for (var i = index1; i < fieldSize; i++) {
            if ((tileArray[i][index2].frame == color) && tileArray[i][index2].TDactive) {
                num++;
            } else {
                break;
            }
        }

        return num;
    }

    function startSwipe() {
        //Set start coordinates
        app.oldX = app.game.input.worldX;
        app.oldY = app.game.input.worldY;

        //Retrieve the picked column/row
        app.oldRow = Math.floor((app.game.world.height - app.oldY) / tileSize);
        app.oldCol = Math.floor((app.game.world.width - app.oldX) / tileSize);

        app.startRow = app.oldRow;
        app.startCol = app.oldCol;

        app.dragging = true;

        //Stop looking for onDown, begin looking for onUp
        app.game.input.onDown.remove(startSwipe);
        app.game.input.onUp.add(endSwipe, app);
    }

    function endSwipe() {
        //Check to see we did not end in the same place we started
        if (!(app.startCol == app.oldCol && app.startRow == app.oldRow)) {
			//Decrement moves and update text
			moves--;
			moveText.setText("Moves : " + moves);
			
            doMatchCheck();
        } else {
            console.log("no movment");
        }

        /*
        //sort testing again
        tileArray[app.startRow][app.startCol].active = false;
        tileArray[app.startRow][app.startCol].frame = 5;
        

        sort();
        */

        //reset swipe related values
        app.oldX = 0;
        app.oldY = 0;
        app.currentX = 0;
        app.currentY = 0;
        app.dragging = false;
        app.isHorizontal = false;
        app.isVertical = false;
        app.oldRow = 0;
        app.oldCol = 0;
        app.currentCol = 0;
        app.currentRow = 0;

        //Stop looking for onUp, begin looking for onDown
        
        app.game.input.onUp.remove(endSwipe);
    }

    //when called loops though array and sorts it puting 
    function sort(changed) {

        for (var i = 0; i < fieldSize; i++) {

            for (var j = 0; j < fieldSize; j++) {
                if (!(tileArray[j][i].LRactive && tileArray[j][i].TDactive)) {

                    tileArray[j][i].frame = 8;

                    for (var k = j + 1; k < fieldSize; k++)
                    {
                        if(tileArray[k][i].LRactive && tileArray[k][i].TDactive){
                            
                            var temp = tileArray[k][i];
                            var tempY = temp.y;
                            var inactiveY = tileArray[j][i].y;

                            var tileTween = app.game.add.tween(tileArray[j][i]);
                            tileTween.to({
                                x: tileArray[j][i].x,
                                y: tempY
                            }, 800, Phaser.Easing.Cubic.Out, true);

                            var tileTween = app.game.add.tween(temp);
                            tileTween.to({
                                x: temp.x,
                                y: inactiveY
                            }, 800, Phaser.Easing.Cubic.Out, true);

                            tileArray[k][i] = tileArray[j][i];
                            tileArray[j][i] = temp;

                            tileArray[k][i].y = tempY;
                            tileArray[j][i].y = inactiveY;

                            break;

                        }
                    }

                }
            }

        }

        app.timer.add(250, function () { repopulate(changed); });
        app.game.time.add(app.timer);
        app.timer.start();

    }

    function repopulate(changed) {

        
        app.game.input.onDown.add(startSwipe, this);
        for (var i = 0; i < fieldSize; i++) {
            for (var j = 0; j < fieldSize; j++) {
                if (!(tileArray[i][j].LRactive && tileArray[i][j].TDactive)) {
                    var randomTile = Math.floor(Math.random() * (tileTypes - 1));
                    tileArray[i][j].frame = randomTile;
                    tileArray[i][j].type = randomTile;
                    tileArray[i][j].LRactive = true;
                    tileArray[i][j].TDactive = true;
                }
            }
        }

        if (changed) {
            doMatchCheck();
            console.log("Your score is: " + score);
            scoreText.setText("Score : " + score);
        }
    }
};