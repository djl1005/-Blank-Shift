"use strict";

var game = new Phaser.Game(300, 350, Phaser.CANVAS);

var mainScreen = function(game){
	this.oldX = undefined;
	this.oldY = undefined;
	this.currentX = undefined;
	this.currentY = undefined;
	this.dragging = null;
	this.isHorizontal = null;
	this.isVertical = null;
	this.oldRow = undefined;
	this.oldCol = undefined;
	this.startCol = undefined;
	this.startRow = undefined;
	this.currentRow = undefined;
	this.currentCol = undefined;
	
	this.timer = null;
	
	this.tileSize = undefined;				// tile size, in pixels
	this.fieldSize = undefined;     			// number of tiles per row/column
	this.tileTypes = undefined;				// different kind of tiles allowed
	this.pickedZoom = undefined;              // zoom ratio to highlight picked tile
	this.score = undefined;
	
	this.tileArray = null;				// array with all game tiles
	this.tileGroup = null; 				// group containing all tiles
	this.movingTileGroup = null;               // group containing the moving tile
	
	this.scoreText = null;	//Text for the player's score
	this.moves = null;
	this.moveText = null;	//Text for the player's remaining moves
	this.uiShift = undefined;		//Pixels to shift the board down by
}

mainScreen.prototype = {
	preload: function() {
		game.load.spritesheet("tiles", "media/tiles.png", 100, 100);
	},
	
	init: function(){
		this.timer = new Phaser.Timer(game, false);
		//this.timer.add(250, this.repopulate);
		
		this.oldX = 0;
		this.oldY = 0;
		this.currentX = 0;
		this.currentY = 0;
		this.dragging = false;
		this.isHorizontal = false;
		this.isVertical = false;
		this.oldRow = 0;
		this.oldCol = 0;
		this.startCol = 0;
		this.startRow = 0;
		this.currentRow = 0;
		this.currentCol = 0;
		
		this.timer;
		
		this.tileSize = 50;				// tile size, in pixels
		this.fieldSize = 6;     			// number of tiles per row/column
		this.tileTypes = 10;				// different kind of tiles allowed
		this.pickedZoom = 1.1;              // zoom ratio to highlight picked tile
		this.score = 0;
		
		this.tileArray = [];				// array with all game tiles
		this.tileGroup; 				// group containing all tiles
		this.movingTileGroup;               // group containing the moving tile
		
		this.scoreText = null;	//Text for the player's score
		this.moves = null;
		this.moveText = null;	//Text for the player's remaining moves
		this.uiShift = 50;		//Pixels to shift the board down by
		
		var that = this;
		console.log("That: " + that.fieldSize);
		//this.timer.add(250, that.repopulate);
	},

	create: function() {
		// show the game in full screen
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setScreenSize();
		game.stage.backgroundColor = '#8E669A';

		this.newBoard(500, 25);
		
		//app.game.input.onDown.add(pickTile, this);
		game.input.onDown.add(this.startSwipe, this);
	},


	update: function() {
		// if we are dragging a tile
		if (this.dragging) {
			//Save end coordinates
			this.currentX = game.input.worldX;
			this.currentY = game.input.worldY;

			//Determine distance travelled in the X and Y
			var xDist = this.oldX - this.currentX;
			var yDist = this.oldY - this.currentY;
			var moveTiles = [];

			//A Horizontal swipe takes place when xDist is at least twice yDist and at least 10 world units
			// see veritical block for more details
			if (this.oldY > this.uiShift && Math.abs(xDist) > Math.abs(yDist) * 2 && Math.abs(xDist) > 10 && !this.isVertical) {
				//Copy the row
				moveTiles = this.tileArray[this.oldRow].slice(0);

				this.isHorizontal = true;

				this.currentCol = Math.floor((game.world.width - this.currentX) / this.tileSize);

				var dist = this.currentCol - this.oldCol;

				for (var i = 0; i < this.fieldSize; i++) {

					var index = i + dist;

					if (index >= this.fieldSize) {
						index = index - this.fieldSize;
					}
					if (index < 0) {
						index = index + this.fieldSize;
					}

					this.tileArray[this.oldRow][index] = moveTiles[i];
					this.tileArray[this.oldRow][index].x = (((this.fieldSize - 1)) - index) * this.tileSize + this.tileSize / 2;

				}
				this.oldCol = this.currentCol;
				this.oldX = this.currentX;
				
			} // end horizontal

			//A Vertical swipe takes place when yDist is at least twice xDist and at least 10 world units
			if (this.oldY > this.uiShift && Math.abs(yDist) > Math.abs(xDist) * 2 && Math.abs(yDist) > 10 && !this.isHorizontal) {
				//Copy the col
				for (var i = 0; i < this.fieldSize; i++) {
					moveTiles.push(this.tileArray[i][this.oldCol]);
				}
				this.isVertical = true;

				//caluclate which row the mouse is curently in
				this.currentRow = Math.floor((game.world.height - this.currentY) / this.tileSize);

				var dist = this.currentRow - this.oldRow;

				for (var i = 0; i < this.fieldSize; i++) {

					var index = i + dist;

					//if the new row index of the sqare is in
					if (index >= this.fieldSize) {
						index = index - this.fieldSize;
					}
					if (index < 0) {
						index = index + this.fieldSize;
					}

					//move it in the array
					this.tileArray[index][this.oldCol] = moveTiles[i];
					//move it's position
					this.tileArray[index][this.oldCol].y = (((this.fieldSize - 1)) - index) * this.tileSize + this.tileSize / 2 + this.uiShift;


				}
				this.oldRow = this.currentRow;
				this.oldY = this.currentY;
			}

		}
		
		if(this.moves <= 0)
			game.state.start('GameOver');
	},
	
	//Generates a new board layout for new levels
	newBoard: function(scoreGoal, moveLimit){
	
		// add groups. movingTileGroup needs to be above tileGroup so moving tiles
		// will always have an higher z index and will always stay on top of the game
		this.tileGroup =  game.add.group();
		this.movingTileGroup = game.add.group();
		
		// game field generation, all tiles initially added to "tileGroup" tile
		for (var i = 0; i < this.fieldSize; i++) {
			this.tileArray[i] = [];
			for (var j = 0; j < this.fieldSize; j++) {
				var randomTile = Math.floor(Math.random() * (this.tileTypes - 1));
				var theTile = game.add.sprite(((this.fieldSize - 1) - j) * this.tileSize + this.tileSize / 2, ((this.fieldSize - 1) - i) * this.tileSize + this.tileSize / 2 + this.uiShift, "tiles");
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
				this.tileArray[i][j] = theTile;
				this.tileGroup.add(theTile);
			}
		}
	
		//Set score and moves
		this.score = 0;
		this.scoreText = game.add.text(game.world.centerX + 10, 10, "Score : 0", {font: '25px Arial', fill: '#fff'});
		this.moves = moveLimit;
		this.moveText = game.add.text(10, 10, "Moves :" + this.moves, { font: '25px Arial', fill: '#fff' });
		
		//Make sure there are no matches on spawn
		this.doMatchCheck();
	
	},

	doMatchCheck: function() {

		var changed = false;
		var localChange = false;

		console.log("boop");

		for (var i = 0; i < this.fieldSize; i++) {
			for (var j = 0; j < this.fieldSize; j++) {

				var leftRight = this.checkLeftRight(i, j, this.tileArray[i][j].frame);
				var topDown = this.checkTopDown(i, j, this.tileArray[i][j].frame);

				//console.log("i:" + i + " j:" + j + " frame:" + tileArray[i][j].frame);

				if (leftRight > 2 && this.tileArray[i][j].LRactive) {
					for (var k = 0; k < leftRight; k++) {
						this.tileArray[i][j + k].LRactive = false;

						if (this.tileArray[i][j].frame == 8) {
							this.moves += leftRight - 1;
							this.moveText.setText("Moves : " + this.moves);
						} else {
							this.score += leftRight;
							
						}

						changed = true;
						localChange = true;
					}
				}

				if ( topDown > 2 && this.tileArray[i][j].TDactive) {
					for (var k = 0; k < topDown; k++) {
						this.tileArray[i + k][j].TDactive = false;

						if (this.tileArray[i][j].frame == 8) {
							this.moves += topDown - 1;
							this.moveText.setText("Moves : " + this.moves);
						} else {
							this.score += topDown;
						}

						changed = true;
						localChange = true;
					}
				}

			}
		}

		if (changed)
		{
			this.sort(changed);
		}
		
		//repopulate();
	},

	//checks for a left to right match: index 1 is y index in array, index 2 is x, color is type of match
	checkLeftRight: function(index1, index2, color) {
		var num = 0;
		for (var i = index2; i < this.fieldSize; i++) {
			
			if ((this.tileArray[index1][i].frame == color) && this.tileArray[index1][i].LRactive) {
				num++;
			} else {
				break;
			}
		}

		return num;
	},

	//checks for a bottom to top match: index 1 is y index in array, index 2 is x, color is type of match
	checkTopDown: function(index1, index2, color) {
		var num = 0;

		for (var i = index1; i < this.fieldSize; i++) {
			if ((this.tileArray[i][index2].frame == color) && this.tileArray[i][index2].TDactive) {
				num++;
			} else {
				break;
			}
		}

		return num;
	},

	startSwipe: function() {
		//Set start coordinates
		this.oldX = game.input.worldX;
		this.oldY = game.input.worldY;

		//Retrieve the picked column/row
		this.oldRow = Math.floor((game.world.height - this.oldY) / this.tileSize);
		this.oldCol = Math.floor((game.world.width - this.oldX) / this.tileSize);

		this.startRow = this.oldRow;
		this.startCol = this.oldCol;

		this.dragging = true;

		//Stop looking for onDown, begin looking for onUp
		game.input.onDown.remove(this.startSwipe);
		game.input.onUp.add(this.endSwipe, this);
	},

	endSwipe: function() {
		//Check to see we did not end in the same place we started
		if (!(this.startCol == this.oldCol && this.startRow == this.oldRow)) {
			//Decrement moves and update text
			this.moves--;
			this.moveText.setText("Moves : " + this.moves);
			
			this.doMatchCheck();
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
		this.oldX = 0;
		this.oldY = 0;
		this.currentX = 0;
		this.currentY = 0;
		this.dragging = false;
		this.isHorizontal = false;
		this.isVertical = false;
		this.oldRow = 0;
		this.oldCol = 0;
		this.currentCol = 0;
		this.currentRow = 0;

		//Stop looking for onUp, begin looking for onDown
		
		game.input.onUp.remove(this.endSwipe);
	},

	//when called loops though array and sorts it puting 
	sort: function(changed) {
		for (var i = 0; i < this.fieldSize; i++) {

			for (var j = 0; j < this.fieldSize; j++) {
				if (!(this.tileArray[j][i].LRactive && this.tileArray[j][i].TDactive)) {

					this.tileArray[j][i].frame = 9;

					for (var k = j + 1; k < this.fieldSize; k++)
					{
						if(this.tileArray[k][i].LRactive && this.tileArray[k][i].TDactive){
							
							var temp = this.tileArray[k][i];
							var tempY = temp.y;
							var inactiveY = this.tileArray[j][i].y;

							var tileTween = game.add.tween(this.tileArray[j][i]);
							tileTween.to({
								x: this.tileArray[j][i].x,
								y: tempY
							}, 800, Phaser.Easing.Cubic.Out, true);

							var tileTween2 = game.add.tween(temp);
							tileTween2.to({
								x: temp.x,
								y: inactiveY
							}, 800, Phaser.Easing.Cubic.Out, true);

							this.tileArray[k][i] = this.tileArray[j][i];
							this.tileArray[j][i] = temp;

							this.tileArray[k][i].y = tempY;
							this.tileArray[j][i].y = inactiveY;

							break;

						}
					}

				}
			}

		}

		var that = this;
		console.log("That: " + that.fieldSize);
		this.timer.add(250, function () { that.repopulate(changed); });
		game.time.add(this.timer);
		this.timer.start();

	},

	repopulate: function(changed) {
		for (var i = 0; i < this.fieldSize; i++) {
			for (var j = 0; j < this.fieldSize; j++) {
				if (!(this.tileArray[i][j].LRactive && this.tileArray[i][j].TDactive)) {
					var randomTile = Math.floor(Math.random() * (this.tileTypes - 1));
					this.tileArray[i][j].frame = randomTile;
					this.tileArray[i][j].type = randomTile;
					this.tileArray[i][j].LRactive = true;
					this.tileArray[i][j].TDactive = true;
				}
			}
		}

		if (changed) {
			this.doMatchCheck();
			this.scoreText.setText("Score : " + this.score);
		} else {
			game.input.onDown.add(this.startSwipe, this);
		}
	}
};		//End mainScreen.prototype

var menuScreen = function(game){}

menuScreen.prototype = {
	preload: function(){
		//load magical play button
	},
	
  	create: function(){
		var playButton = this.game.add.button(150,175,"play",this.playGame,this);
		playButton.anchor.setTo(0.5,0.5);
	},
	
	playGame: function(){
		this.game.state.start('Main');
	}
}

var endScreen = function(game){}

endScreen.prototype = {
	preload: function(){
		//load mystical replay button
	},
	
	create: function(){
		var restartButton = this.game.add.button(150, 175, "replay", this.restart, this);
		restartButton.anchor.setTo(0.5, 0.5);
	},
	
	restart: function(){
		this.game.state.start('Main');
	}
}

game.state.add('Menu', menuScreen);
game.state.add('Main', mainScreen);
game.state.add('GameOver', endScreen);
game.state.start('Menu');
