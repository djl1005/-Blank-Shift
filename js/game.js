

var app = app || {};

window.onload = function () {
    "use strict";

    app.game = new Phaser.Game(300, 300, Phaser.CANVAS, "", { preload: onPreload, create: onCreate, update: onUpdate });

    app.startX = 0;
    app.startY = 0;
    app.endX = 0;
    app.endY = 0;
    app.dragging = false;
    app.movingRow = 0;
    app.movingCol = 0;
    app.endRow = 0;
    app.endCol =0;

    var tileSize = 50;				// tile size, in pixels
    var fieldSize = 6;     			// number of tiles per row/column
    var tileTypes = 6;				// different kind of tiles allowed
    var pickedZoom = 1.1;              // zoom ratio to highlight picked tile

    var tileArray = [];				// array with all game tiles
    var tileGroup; 				// group containing all tiles
    var movingTileGroup;               // group containing the moving tile

    function onPreload() {
        app.game.load.spritesheet("tiles", "media/tiles.png", tileSize, tileSize);
    }

    function onCreate() {
        // show the game in full screen
        app.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        app.game.scale.setScreenSize();
        // add groups. movingTileGroup needs to be above tileGroup so moving tiles
        // will always have an higher z index and will always stay on top of the game
        tileGroup = app.game.add.group();
        movingTileGroup = app.game.add.group();
        // game field generation, all tiles initially added to "tileGroup" tile
        for (var i = 0; i < fieldSize; i++) {
            tileArray[i] = [];
            for (var j = 0; j < fieldSize; j++) {
                var randomTile = Math.floor(Math.random() * tileTypes);
                var theTile = app.game.add.sprite(((fieldSize - 1) - j) * tileSize + tileSize / 2, ((fieldSize - 1) - i) * tileSize + tileSize / 2, "tiles");
                theTile.frame = randomTile;
                theTile.type = randomTile;
                theTile.col = i;
                theTile.anchor.setTo(0.5, 0.5);
                tileArray[i][j] = theTile;
                tileGroup.add(theTile);
            }
            //app.game.input.onDown.add(pickTile, this);
            app.game.input.onDown.add(startSwipe, this);
        }
    }

    function pickTile() {
        // save input coordinates
        app.startX = app.game.input.worldX;
        app.startY = app.game.input.worldY;
        // retrieve picked row and column 

        console.log(app.game.world.height - app.startY);

        app.movingRow = Math.floor((app.game.world.height - app.startY) / tileSize);
        app.movingCol = Math.floor((app.game.world.width - app.startX) / tileSize);
        // move the tile to the upper group, so it will surely be at top of the stage
        movingTileGroup.add(tileArray[app.movingRow][app.movingCol]);
        // zoom the tile
        tileArray[app.movingRow][app.movingCol].width = tileSize * pickedZoom;
        tileArray[app.movingRow][app.movingCol].height = tileSize * pickedZoom;
        // now dragging is allowed
        app.dragging = true;
        // update listeners
        app.game.input.onUp.add(startSwipe, this);
        //game.input.onUp.add(releaseTile, this);
    }

    function onUpdate() {
        // if we are dragging a tile
        if (app.dragging) {
            // check x and y distance from starting to current input location
            // move the tile
            tileArray[app.movingRow][app.movingCol].x = app.game.input.worldX;
            tileArray[app.movingRow][app.movingCol].y = app.game.input.worldY;
            doMatchCheck();
        }
    }

    function doMatchCheck() {
        for (var i = 0; i < fieldSize; i++) {
            for (var j = 0; j < fieldSize; j++) {
                checkLeftRight(i, j, tileArray[i][j].frame);
                checkTopDown(i, j, tileArray[i][j].frame);
            }
        }
    }

    function checkLeftRight(index1, index2, color) {
        var num = 0;

        for (var i = index1; i < fieldSize; i++) {
            if (tileArray[i][index2].frame == color) {
                num++;
            } else {
                break;
            }
        }

        if (num > 2) {
            console.log("Left Right - " + index1 + ", " + index2 + ": " + num);
        }
    }

    function checkTopDown(index1, index2, color) {
        var num = 0;

        for (var i = index2; i < fieldSize; i++) {
            if (tileArray[index1][i].frame == color) {
                num++;
            } else {
                break;
            }
        }

        if (num > 2) {
            console.log("Top Down - " + index1 + ", " + index2 + ": " + num);
        }
    }

    function startSwipe() {
        //Set start coordinates
        app.startX = app.game.input.worldX;
        app.startY = app.game.input.worldY;

        //Retrieve the picked column/row
        app.movingRow = Math.floor((app.game.world.height - app.startY) / tileSize);
        app.movingCol = Math.floor((app.game.world.width - app.startX) / tileSize);

        //Stop looking for onDown, begin looking for onUp
        app.game.input.onDown.remove(startSwipe);
        app.game.input.onUp.add(endSwipe, app);
    }

    function endSwipe() {
        //Save end coordinates
        app.endX = app.game.input.worldX;
        app.endY = app.game.input.worldY;

        //Determine distance travelled in the X and Y
        var xDist = app.startX - app.endX;
        var yDist = app.startY - app.endY;
        var moveTiles = [];


        //Print out old array
        console.log("Old Array");
        var row = tileArray[5].slice(0);
        console.log(row[0].frame + "," + row[1].frame + "," + row[2].frame + "," + row[3].frame + "," + row[4].frame + "," + row[5].frame);
  

        //A Horizontal swipe takes place when xDist is at least twice yDist and at least 10 pixels
        if (Math.abs(xDist) > Math.abs(yDist) * 2 && Math.abs(xDist) > 10) {
            //Copy the row
            moveTiles = tileArray[app.movingRow].slice(0);

            app.endCol = Math.floor((app.game.world.width - app.endX) / tileSize);

            var dist = app.endCol - app.movingCol;

            for ( var i = 0;  i < fieldSize; i++)
            {

                var index = i + dist;

                if(index >= fieldSize )
                {
                    index = index - fieldSize;
                }
                if (index < 0 ) {
                    index = index + fieldSize;
                }

                console.log(index);

                tileArray[app.movingRow][index] = moveTiles[i];
                tileArray[app.movingRow][index].x = (((fieldSize - 1)) - index) * tileSize + tileSize / 2;


            }

            console.log(tileArray[app.movingRow]);

        } // end horizontal

        //A Vertical swipe takes place when yDist is at least twice xDist and at least 10 pixels
        if (Math.abs(yDist) > Math.abs(xDist) * 2 && Math.abs(yDist) > 10) {
            //Copy the row
            for (var i = 0; i < fieldSize; i++) {
                moveTiles.push(tileArray[i][app.movingCol]);
            }

            app.endRow = Math.floor((app.game.world.height - app.endY) / tileSize);

            var dist = app.endRow - app.movingRow;

            for (var i = 0; i < fieldSize; i++) {

                var index = i + dist;

                if (index >= fieldSize) {
                    index = index - fieldSize;
                }
                if (index < 0) {
                    index = index + fieldSize;
                }

                console.log(index);

                tileArray[index][app.movingCol] = moveTiles[i];
                tileArray[index][app.movingCol].y = (((fieldSize - 1)) - index) * tileSize + tileSize / 2;


            }

            console.log(tileArray[app.movingRow]);
        }

        //Print out new array
        console.log("New Array");
        var newRow = tileArray[5].slice(0);
        console.log(newRow[0].type + "," + newRow[1].type + "," + newRow[2].type + "," + newRow[3].type + "," + newRow[4].type + "," + newRow[5].type);

        doMatchCheck();

        //Stop looking for onUp, begin looking for onDown
        app.game.input.onDown.add(startSwipe, this);
        app.game.input.onUp.remove(endSwipe);

    }


};