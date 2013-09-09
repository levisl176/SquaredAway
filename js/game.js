// ------------------------------------------------------------------------- //
// -- window.game
// ------------------------------------------------------------------------- //
// For use with the Squared Away web app.
// 
// All of the overall game logic is encapsulated in this anonymous function.  
// This is then stored in the window.game property.  This has the effect of 
// minimizing side-effects and problems when linking multiple script files.
// 
// Dependencies:
//		- window.log
//		- window.Sprite
//		- window.Block
//		- window.PreviewWindow
//		- window.gameWindow
//		- window.input
//		- window.sound
//		- utils
// ------------------------------------------------------------------------- //

(function() {
	"use strict";

	log.d("-->game.LOADING_MODULE");

	// --------------------------------------------------------------------- //
	// -- Private, static members

	var _GAME_AREA_SIZE_RATIO = 0.76; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_SIZE_RATIO = 0.08; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_OUTER_MARGIN_RATIO = 0.02; // a ratio of overall canvas size
	var _PREVIEW_WINDOW_INNER_MARGIN_RATIO = (1 - (_GAME_AREA_SIZE_RATIO + 
			((_PREVIEW_WINDOW_SIZE_RATIO + _PREVIEW_WINDOW_OUTER_MARGIN_RATIO) * 2))) / 2; // a ratio of overall canvas size

	var _START_OF_GAME_INITIAL_COOL_DOWN_PERIOD = 800; // millis
	var _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME = 50000; // in millis
	var _PREVIEW_WINDOW_COOL_DOWN_TIME_GROWTH_RATE = -0.21; // linear // TODO: test/tweak this

	var _INITIAL_BLOCK_FALL_SPEED = 0.001; // in squares per millis
	var _BLOCK_FALL_SPEED_GROWTH_RATE = 0.45; // linear // TODO: test/tweak this

	var _INITIAL_CENTER_SQUARE_COLOR_PERIOD = 9000; // millis per color
	var _CENTER_SQUARE_COLOR_PERIOD_GROWTH_RATE = -0.10;

	var _INITIAL_COLLAPSE_DELAY = 500; // millis
	var _COLLAPSE_DELAY_GROWTH_RATE = -0.10;

	var _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL = 3; // TODO: test/tweak this
	var _LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE = 0.334; // TODO: test/tweak this

	var _BASE_SCORE_PER_SQUARE = 10;
	var _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED = 0.02; // TODO: test/tweak this
	var _SCORE_GROWTH_RATE_PER_RECENT_LAYER = 0.50; // TODO: test/tweak this

	var _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD = _INITIAL_COLLAPSE_DELAY + 200;

	var _POINTS_FOR_BONUS = 2500; // TODO: test/tweak this

	var _INITIAL_COLLAPSE_BOMB_COUNT = 2; // TODO: test/tweak this
	var _INITIAL_SETTLE_BOMB_COUNT = 2; // TODO: test/tweak this

	// A cross-browser compatible requestAnimationFrame. From
	// https://hacks.mozilla.org/2011/08/animating-with-javascript-from-setinterval-to-requestanimationframe/
	var _myRequestAnimationFrame = 
		window.requestAnimationFrame || // the standard
		window.webkitRequestAnimationFrame || // chrome/safari
		window.mozRequestAnimationFrame || // firefox
		window.oRequestAnimationFrame || // opera
		window.msRequestAnimationFrame || // ie
		function(callback) { // default
			window.setTimeout(callback, 16); // 60fps
		};

	// ----------------------------------------------------------------- //
	// -- Private members

	var _previewWindowSizePixels = 0; // in pixels
	var _previewWindowOuterMarginPixels = 0; // in pixels
	var _previewWindowInnerMarginPixels = 0; // in pixels

	var _canvas = null;
	var _context = null;
	var _levelDisplay = null;
	var _scoreDisplay = null;
	var _onGameEnd = null;

	var _isLooping = false;

	var _prevTime = 0;
	var _previewWindows = null;
	var _collapseBombWindow = null;
	var _settleBombWindow = null;

	var _score = 0;
	var _level = 1;
	var _gameTime = 0; // active (unpaused) time since start of game
	var _layersCollapsedCount = 0;
	var _squaresCollapsedCount = 0;
	var _collapseBombsUsedCount = 0;
	var _settleBombsUsedCount = 0;
	var _blocksHandledCount = 0;

	var _currentBlockFallSpeed = _INITIAL_BLOCK_FALL_SPEED; // squares per millis
	var _currentCenterSquareColorPeriod = _INITIAL_CENTER_SQUARE_COLOR_PERIOD; // millis per color

	var _currentPreviewWindowCoolDownTime = _INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME; // in millis

	var _layerCountForNextLevel = _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL;
	var _layersCollapsedSinceLastLevel = 0;

	var _recentCollapsesCount = 0;
	var _prevCollapseTime = 0;

	var _pointsForPrevBonus = 0;

	// The game loop drives the progression of frames and game logic
	function _gameLoop() {
		_isLooping = true;

		// Get the timing of the current frame
		var currTime = Date.now();
		var deltaTime = currTime - _prevTime;

		// Check whether the game is unpaused
		if (!game.isPaused && !game.isEnded) {
			// Update the game state for the current frame
			_update(deltaTime);
			_draw();

			_myRequestAnimationFrame(_gameLoop);
		} else {
			_isLooping = false;
		}

		// Go to the next frame
		_prevTime = currTime;
	}

	// Update each of the game entities with the current time.
	function _update(deltaTime) {
		_gameTime += deltaTime;

		var i;

		input.update(deltaTime);

		gameWindow.update(deltaTime);

		// Update the preview windows
		for (i = 0; i < 4; ++i) {
			_previewWindows[i].update(deltaTime);

			// If the preview window has finished its cool down, then add 
			// its block to the game area and start a new block in preview 
			// window
			if (_previewWindows[i].isCoolDownFinished()) {
				_setupNextBlock(_previewWindows[i]);
			}
		}

		// Loop through each square in the game area and possibly animate 
		// it with a shimmer
		// TODO: 
	}

	function _draw() {
		// Clear the canvas
		_context.clearRect(0, 0, _canvas.width, _canvas.height);

		var i;

		// Draw the preview windows
		for (i = 0; i < 4; ++i) {
			_previewWindows[i].draw(_context);
		}

		// Draw the game window
		gameWindow.draw(_context);
	}

	// Set up a new game
	function _reset() {
		log.d("-->game._reset");

		_score = 0;
		_gameTime = 0;
		game.isPaused = true;
		game.isEnded = true;
		_prevTime = 0;

		gameWindow.reset();
		input.reset();

		_setLevel(game.startingLevel);

		_layersCollapsedCount = 0;
		_squaresCollapsedCount = 0;
		_collapseBombsUsedCount = 0;
		_settleBombsUsedCount = 0;
		_blocksHandledCount = 0;

		var deltaCoolDown = _currentPreviewWindowCoolDownTime / 4;

		// Start each of the preview windows
		for (var i = 0, coolDown = _START_OF_GAME_INITIAL_COOL_DOWN_PERIOD; 
				i < 4; 
				++i, coolDown += deltaCoolDown) {
			_previewWindows[i].startNewBlock(coolDown);
		}

		_recentCollapsesCount = 0;
		_prevCollapseTime = 0;

		log.d("<--game._reset");
	}

	function _setLevel(level) {
		_level = level;

		// Increase the block fall speed
		_currentBlockFallSpeed = utils.getLinGrowthValue(
				_INITIAL_BLOCK_FALL_SPEED, 
				_BLOCK_FALL_SPEED_GROWTH_RATE, 
				_level);
		Block.prototype.setFallSpeed(_currentBlockFallSpeed);

		// Increase the rate of the center square color changes
		_currentCenterSquareColorPeriod = utils.getExpGrowthValue(
				_INITIAL_CENTER_SQUARE_COLOR_PERIOD, 
				_CENTER_SQUARE_COLOR_PERIOD_GROWTH_RATE, 
				_level);
		gameWindow.setCenterSquareColorPeriod(_currentCenterSquareColorPeriod);

		// Decrease the preview window cooldown time
		_currentPreviewWindowCoolDownTime = utils.getExpGrowthValue(
				_INITIAL_PREVIEW_WINDOW_COOL_DOWN_TIME, 
				_PREVIEW_WINDOW_COOL_DOWN_TIME_GROWTH_RATE, 
				_level);
		for (var i = 0; i < 4; ++i) {
			_previewWindows[i].setCoolDownPeriod(_currentPreviewWindowCoolDownTime);
		}

		// Decrease the layer collapse delay
		var layerCollapseDelay = utils.getExpGrowthValue(
				_INITIAL_COLLAPSE_DELAY, 
				_COLLAPSE_DELAY_GROWTH_RATE, 
				_level);
		gameWindow.setLayerCollapseDelay(layerCollapseDelay);

		// Get how many layers need to be collapsed to progress to the 
		// next level
		_layerCountForNextLevel = utils.getLinGrowthValue(
				game.completingSquaresOn ? _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL : _INITIAL_LAYER_COUNT_FOR_NEXT_LEVEL * 4, 
				_LAYER_COUNT_FOR_NEXT_LEVEL_GROWTH_RATE, 
				_level);
		_layersCollapsedSinceLastLevel = 0;

		var currentBackgroundColorIndex = (_level - 2) % game.DARK_COLORS.length;
		gameWindow.setCurrentBackgroundColorIndex(currentBackgroundColorIndex);

		_levelDisplay.innerHTML = _level;
	}

	function _computeDimensions() {
		gameWindow.gameWindowPixelSize = _canvas.width * _GAME_AREA_SIZE_RATIO;
		_previewWindowSizePixels = _canvas.width * _PREVIEW_WINDOW_SIZE_RATIO;
		_previewWindowOuterMarginPixels = _canvas.width * _PREVIEW_WINDOW_OUTER_MARGIN_RATIO;
		_previewWindowInnerMarginPixels = _canvas.width * _PREVIEW_WINDOW_INNER_MARGIN_RATIO;
		gameWindow.gameWindowPosition.x = _previewWindowSizePixels + _previewWindowOuterMarginPixels + _previewWindowInnerMarginPixels;
		gameWindow.gameWindowPosition.y = gameWindow.gameWindowPosition.x;
	}

	function _setUpPreviewWindows() {
		var size = _previewWindowSizePixels;

		// This is the horizontal distance (in pixels) from the left side 
		// of the canvas to the left side of the top-side preview window
		var tmp1 = (_previewWindowSizePixels / 2) + 
					_previewWindowOuterMarginPixels + 
					_previewWindowInnerMarginPixels + 
					(gameWindow.gameWindowPixelSize / 2);

		// This is the horizontal distance (in pixels) from the left side 
		// of the canvas to the left side of the right-side preview window
		var tmp2 = _previewWindowSizePixels + 
					_previewWindowOuterMarginPixels + 
					(_previewWindowInnerMarginPixels * 2) + 
					gameWindow.gameWindowPixelSize;

		var x1 = tmp1;
		var y1 = _previewWindowInnerMarginPixels;
		var x2 = tmp2;
		var y2 = tmp1;
		var x3 = tmp1;
		var y3 = tmp2;
		var x4 = _previewWindowInnerMarginPixels;
		var y4 = tmp1;

		var previewWindow1 = new PreviewWindow(x1, y1, size, 0);
		var previewWindow2 = new PreviewWindow(x2, y2, size, 1);
		var previewWindow3 = new PreviewWindow(x3, y3, size, 2);
		var previewWindow4 = new PreviewWindow(x4, y4, size, 3);

		_previewWindows = [previewWindow1, previewWindow2, previewWindow3, previewWindow4];
	}

	function _setUpBombWindows() {
		var x;
		var y;
		var w;
		var h;

		x = -1;
		y = -1;
		w = -1;
		h = -1;
		_collapseBombWindow = new BombWindow(x, y, w, h, 
				BombWindow.prototype.COLLAPSE_BOMB, _INITIAL_COLLAPSE_BOMB_COUNT);

		x = -1;
		y = -1;
		w = -1;
		h = -1;
		_settleBombWindow = new BombWindow(x, y, w, h, 
				BombWindow.prototype.SETTLE_BOMB, _INITIAL_SETTLE_BOMB_COUNT);

		// TODO: ****
	}

	function _play() {
		// Reset game state if a game is not currently in progress
		if (game.isEnded) {
			_reset();
			game.isEnded = false;
		}

		if (game.isPaused || game.isEnded) {
			_prevTime = Date.now();
		}

		game.isPaused = false;

		// If the game loop is not already running, then start it
		if (!_isLooping) {
			_gameLoop();
		}
	}

	function _pause() {
		game.isPaused = true;
	}

	function _endGame() {
		game.isEnded = true;
		_onGameEnd();
	}

	function _addCollapseToScore(squaresCollapsedCount) {
		_squaresCollapsedCount += squaresCollapsedCount;
		++_layersCollapsedCount;
		++_layersCollapsedSinceLastLevel;

		// Give a slight exponential score increase for the number of 
		// blocks in the current layer collapse
		var score = utils.getExpGrowthValue(
				_BASE_SCORE_PER_SQUARE, 
				game.completingSquaresOn ? _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED : _SCORE_GROWTH_RATE_PER_SQUARE_COLLAPSED / 4, 
				squaresCollapsedCount) * squaresCollapsedCount;

		// Give a large exponential score increase if the previous layer 
		// collapse occurred very recently
		var currentCollapseTime = Date.now();
		_recentCollapsesCount = currentCollapseTime - _prevCollapseTime < _TIME_BETWEEN_RECENT_COLLAPSES_THRESHOLD ? _recentCollapsesCount + 1 : 0;
		_prevCollapseTime = currentCollapseTime;
		score = utils.getExpGrowthValue(
				score, 
				game.completingSquaresOn ? _SCORE_GROWTH_RATE_PER_RECENT_LAYER : _SCORE_GROWTH_RATE_PER_RECENT_LAYER / 4, 
				_recentCollapsesCount);

		_score += Math.floor(score);

		_scoreDisplay.innerHTML = _score;

		// Check whether the player has collapsed enough layers to move on 
		// to the next level
		if (_layersCollapsedSinceLastLevel >= _layerCountForNextLevel) {
			_setLevel(_level + 1);

			sound.playSFX("level");
		}

		// Check whether the player has earned anything with the new score
		if (_score > _pointsForPrevBonus + _POINTS_FOR_BONUS) {
			// TODO: give the player the bonus

			_pointsForPrevBonus += _POINTS_FOR_BONUS;

			sound.playSFX("earnedBonus");
		}
	}

	function _setupNextBlock(previewWindow) {
		var block = previewWindow.getCurrentBlock();

		// If there is a square on the game area in the way the 
		// new block from being added, then the game is over and 
		// the player has lost
		if (block.checkIsOverTopSquare(gameWindow.squaresOnGameWindow)) {
			game.endGame();
			return;
		}

		gameWindow.blocksOnGameWindow.push(block);
		previewWindow.startNewBlock();
		++_blocksHandledCount;

		if (game.keyboardControlOn && !input.selectedKeyboardBlock) {
			input.selectedKeyboardBlock = block;
		}

		sound.playSFX("newBlock");
	}

	function _forceNextBlock() {
		// Determine which preview window is next
		var nextPreviewWindow = _previewWindows[0];
		var longestTime = _previewWindows[0].getTimeSinceLastBlock();
		var currentTime;
		var i;
		for (i = 0; i < 4; ++i) {
			currentTime = _previewWindows[i].getTimeSinceLastBlock();
			if (currentTime > longestTime) {
				longestTime = currentTime;
				nextPreviewWindow = _previewWindows[i];
			}
		}

		// Force the next preview window to release its block now
		_setupNextBlock(nextPreviewWindow);
	}

	function _primeCollapseBomb() {
		_collapseBombWindow.primeBomb();
	}

	function _primeSettleBomb() {
		_settleBombWindow.primeBomb();
	}

	function _releaseCollapseBomb() {
		_collapseBombWindow.releaseBomb();
	}

	function _releaseSettleBomb() {
		_settleBombWindow.releaseBomb();
	}

	function _getIsCollapseBombPrimed() {
		return _collapseBombWindow.getIsPrimed();
	}

	function _getIsSettleBombPrimed() {
		return _settleBombWindow.getIsPrimed();
	}

	function _getScore() {
		return _score;
	}

	function _getLevel() {
		return _level;
	}

	function _getTime() {
		return _gameTime;
	}

	function _getLayersCollapsed() {
		return _layersCollapsedCount;
	}

	function _getSquaresCollapsed() {
		return _squaresCollapsedCount;
	}

	function _getBlocksHandled() {
		return _blocksHandledCount;
	}

	function _getCollapseBombsUsed() {
		return _collapseBombsUsedCount;
	}

	function _getSettleBombsUsed() {
		return _settleBombsUsedCount;
	}

	function _setDOMElements(canvas, levelDisplay, scoreDisplay, onGameEnd) {
		_canvas = canvas;
		_context = _canvas.getContext("2d");
		_levelDisplay = levelDisplay;
		_scoreDisplay = scoreDisplay;
		_onGameEnd = onGameEnd;

		_computeDimensions();
		_setUpPreviewWindows();
		_setUpBombWindows();

		gameWindow.init();
	}

	// Make Game available to the rest of the program
	window.game = {
		draw: _draw,
		update: _update,
		reset: _reset,
		play: _play,
		pause: _pause,
		endGame: _endGame,

		getScore: _getScore,
		getLevel: _getLevel,
		getTime: _getTime,
		getLayersCollapsed: _getLayersCollapsed,
		getSquaresCollapsed: _getSquaresCollapsed,
		getBlocksHandled: _getBlocksHandled,
		getCollapseBombsUsed: _getCollapseBombsUsed,
		getSettleBombsUsed: _getSettleBombsUsed,

		addCollapseToScore: _addCollapseToScore,

		setDOMElements: _setDOMElements,

		forceNextBlock: _forceNextBlock,

		primeCollapseBomb: _primeCollapseBomb,
		primeSettleBomb: _primeSettleBomb,
		releaseCollapseBomb: _releaseCollapseBomb,
		releaseSettleBomb: _releaseSettleBomb,

		getIsCollapseBombPrimed: _getIsCollapseBombPrimed,
		getIsSettleBombPrimed: _getIsSettleBombPrimed,

		isPaused: true,
		isEnded: true,

		musicOn: true,
		sfxOn: true,

		keyboardControlOn: false,
		completingSquaresOn: true,
		canFallPastCenterOn: true,
		canChangeFallDirectionOn: false,
		switchQuadrantsWithFallDirectionOn: false,
		collapseCausesSettlingOn: false,
		layersAlsoSettleInwardsOn: true,
		blocksFallOutwardOn: false,
		bombsOn: false,
		peanutGalleryOn: false,

		startingLevel: 1,
		numberOfSquaresInABlock: 7,

		MEDIUM_COLORS: [
			{ r: 55,	g: 178,	b: 22, a: 1.0, str: "rgba(55,178,22,1.0)" },	// Green
			{ r: 22,	g: 99,	b: 178, a: 1.0, str: "rgba(22,99,178,1.0)" },	// Blue
			{ r: 132,	g: 22,	b: 178, a: 1.0, str: "rgba(132,22,178,1.0)" },	// Purple
			{ r: 178,	g: 22,	b: 44, a: 1.0, str: "rgba(178,22,44,1.0)" },	// Red
			{ r: 178,	g: 99,	b: 22, a: 1.0, str: "rgba(178,99,22,1.0)" },	// Orange
			{ r: 178,	g: 172,	b: 22, a: 1.0, str: "rgba(178,172,22,1.0)" },	// Yellow
			{ r: 100,	g: 100,	b: 100, a: 1.0, str: "rgba(100,100,100,1.0)" }	// Grey
		],

		LIGHT_COLORS: [
			{ r: 175,	g: 243,	b: 157, a: 1.0, str: "rgba(175,243,157,1.0)" },	// Green
			{ r: 157,	g: 199,	b: 243, a: 1.0, str: "rgba(157,199,243,1.0)" },	// Blue
			{ r: 218,	g: 157,	b: 243, a: 1.0, str: "rgba(218,157,243,1.0)" },	// Purple
			{ r: 243,	g: 157,	b: 169, a: 1.0, str: "rgba(243,157,169,1.0)" },	// Red
			{ r: 243,	g: 199,	b: 157, a: 1.0, str: "rgba(243,199,157,1.0)" },	// Orange
			{ r: 243,	g: 240,	b: 157, a: 1.0, str: "rgba(243,240,157,1.0)" },	// Yellow
			{ r: 200,	g: 200,	b: 200, a: 1.0, str: "rgba(200,200,200,1.0)" }	// Grey
		],

		DARK_COLORS: [
			{ r: 11,	g: 39,	b: 5, a: 1.0, str: "rgba(11,39,5,1.0)" },		// Green
			{ r: 6,		g: 29,	b: 54, a: 1.0, str: "rgba(6,29,54,1.0)" },		// Blue
			{ r: 37,	g: 6,	b: 50, a: 1.0, str: "rgba(37,6,50,1.0)" },		// Purple
			{ r: 54,	g: 6,	b: 13, a: 1.0, str: "rgba(54,6,13,1.0)" },		// Red
			{ r: 50,	g: 28,	b: 6, a: 1.0, str: "rgba(50,28,6,1.0)" },		// Orange
			{ r: 49,	g: 45,	b: 5, a: 1.0, str: "rgba(49,45,5,1.0)" },		// Yellow
			{ r: 34,	g: 34,	b: 34, a: 1.0, str: "rgba(34,34,34,1.0)" }		// Grey
		],

		PREVIEW_WINDOW_PROGRESS_FILLS: [
			{ r: 33,	g: 51,	b: 63, a: 1.0, str: "rgba(33,51,63,1.0)" },		// Blue
			{ r: 63,	g: 63,	b: 39, a: 1.0, str: "rgba(63,63,39,1.0)" },		// Yellow
			{ r: 44,	g: 63,	b: 42, a: 1.0, str: "rgba(44,63,42,1.0)" },		// Green
			{ r: 63,	g: 43,	b: 43, a: 1.0, str: "rgba(63,43,43,1.0)" }		// Red
		],

		PREVIEW_WINDOW_PROGRESS_STROKES: [
			{ r: 132,	g: 206,	b: 255, a: 1.0, str: "rgba(132,206,255,1.0)" },		// Blue
			{ r: 255,	g: 255,	b: 156, a: 1.0, str: "rgba(255,255,156,1.0)" },		// Yellow
			{ r: 178,	g: 255,	b: 170, a: 1.0, str: "rgba(178,255,170,1.0)" },		// Green
			{ r: 255,	g: 174,	b: 174, a: 1.0, str: "rgba(255,174,174,1.0)" }		// Red
		],

		DEFAULT_FILL: { r: 20, g: 20, b: 20, a: 1.0, str: "rgba(20,20,20,1.0)" }, // Off-black
		DEFAULT_STROKE: { r: 90, g: 90, b: 90, a: 1.0, str: "rgba(90,90,90,1.0)" }, // Darkish grey

		VALID_MOVE_FILL: { r: 100, g: 200, b: 255, a: 0.2, str: "rgba(100,200,255,0.2)" }, // Neon blue
		VALID_MOVE_STROKE: { r: 100, g: 200, b: 255, a: 0.5, str: "rgba(100,200,255,0.5)" }, // Lighter neon blue

		INVALID_MOVE_FILL: { r: 255, g: 120, b: 120, a: 0.8, str: "rgba(255,120,120,0.8)" }, // Neon red
		INVALID_MOVE_STROKE: { r: 255, g: 200, b: 200, a: 1.0, str: "rgba(255,200,200,1.0)" } // Lighter neon red

		// DARK_COLORS: [
			// { r: 18,	g: 61,	b: 7 },		// Green
			// { r: 7,		g: 33,	b: 61 },	// Blue
			// { r: 45,	g: 7,	b: 61 },	// Purple
			// { r:61 ,	g: 7,	b: 15 },	// Red
			// { r: 61,	g: 34,	b: 7 },		// Orange
			// { r: 61,	g: 58,	b: 7 },		// Yellow
			// { r: 34,	g: 34,	b: 34 }		// Grey
		// ]
	};

	log.i("<--game.LOADING_MODULE");
}());
