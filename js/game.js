"use strict";

var app = app || {};

app.game = new Phaser.Game(800, 600, Phaser.AUTO);
 
var tileSize = 50;				// tile size, in pixels
var fieldSize = 6;     			// number of tiles per row/column
var tileTypes = 6;				// different kind of tiles allowed
var pickedZoom = 1.1;              // zoom ratio to highlight picked tile

var tileArray = [];				// array with all game tiles
	var tileGroup; 				// group containing all tiles
	var movingTileGroup;               // group containing the moving tile