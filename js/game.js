"use strict";

var app = app || {};

window.onload = function(){

	app.game = new Phaser.Game(300,300,Phaser.CANVAS,"",{preload:onPreload, create:onCreate, update:onUpdate});
	
	app.startX;
	app.startY;
	app.dragging;
	app.movingRow;
	app.movingCol;
	
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
				var theTile= app.game.add.sprite(((fieldSize - 1) - j) *tileSize+tileSize/2,((fieldSize - 1) - i)*tileSize+tileSize/2,"tiles");
				theTile.frame = randomTile;
				theTile.anchor.setTo(0.5,0.5);
				tileArray[i][j]=theTile;
				tileGroup.add(theTile);	
			}
			app.game.input.onDown.add(pickTile, this);
		}	
	}
	
	function pickTile(){
		// save input coordinates
		app.startX = app.game.input.worldX;
		app.startY = app.game.input.worldY;
		// retrieve picked row and column 
		
		console.log(app.game.world.height - app.startY);
		
		app.movingRow = Math.floor(( app.game.world.height - app.startY )/tileSize);
		app.movingCol = Math.floor( ( app.game.world.width - app.startX ) /tileSize);
		// move the tile to the upper group, so it will surely be at top of the stage
		movingTileGroup.add(tileArray[app.movingRow][app.movingCol]);
		// zoom the tile
		tileArray[app.movingRow][app.movingCol].width=tileSize*pickedZoom;
		tileArray[app.movingRow][app.movingCol].height=tileSize*pickedZoom;
		// now dragging is allowed
		app.dragging = true ;
		// update listeners
		app.game.input.onDown.remove(pickTile, this);
		//game.input.onUp.add(releaseTile, this);
	}
	
	function onUpdate() {
		// if we are dragging a tile
		if(app.dragging){
			// check x and y distance from starting to current input location
			// move the tile
			tileArray[app.movingRow][app.movingCol].x= app.game.input.worldX;
			tileArray[app.movingRow][app.movingCol].y= app.game.input.worldY;
		}
	}
	
	
};