"use strict";

var app = app || {};

app.game = new Phaser.Game(800, 600, Phaser.AUTO,"",{preload:onPreload, create:onCreate, update:onUpdate});
 
var tileSize = 50;				// tile size, in pixels
var fieldSize = 6;     			// number of tiles per row/column
var tileTypes = 6;				// different kind of tiles allowed
var pickedZoom = 1.1;              // zoom ratio to highlight picked tile

var tileArray = [];				// array with all game tiles
	var tileGroup; 				// group containing all tiles
	var movingTileGroup;               // group containing the moving tile
	
	function onPreload() {
					app.game.load.spritesheet("tiles","media/tiles.png",tileSize,tileSize);
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
	for(var i=0;i<fieldSize;i++){
		tileArray[i]=[];
		for( var j=0;j<fieldSize;j++){
			var randomTile = Math.floor(j);
			var theTile= app.game.add.sprite((fieldSize - j) *tileSize+tileSize/2,(fieldSize - i)*tileSize+tileSize/2,"tiles");
			theTile.frame = randomTile;
			theTile.anchor.setTo(0.5,0.5);
			tileArray[i][j]=theTile;
            tileGroup.add(theTile);	
		}
	}	
}

function onUpdate() {
	// if we are dragging a tile
	if(false){
		// check x and y distance from starting to current input location
		distX = game.input.worldX-startX;
                		distY = game.input.worldY-startY;
                		// move the tile
                          tileArray[movingRow][movingCol].x=movingCol*tileSize+tileSize/2+distX;
                          tileArray[movingRow][movingCol].y=movingRow*tileSize+tileSize/2+distY;
	}
   	}


