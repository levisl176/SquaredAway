<!doctype html>
<html lang="en">
<head>
	<title>Squared Away</title>

	<meta charset="utf-8">
	<meta name="description" content="A tile-matching puzzle game">
	<meta name="viewport" content="width=device-width">

	<link rel="shortcut icon" href="img/icon.ico">
	<link rel="stylesheet" href="css/squaredaway.css">
</head>
<body>
	<div id="pageColumn">
		<div id="banner">
			<img src="img/title.png" alt="Squared Away">
		</div>

		<div id="noJavaScriptArea">
			<p>
				Hey!  This spiffy web app needs JavaScript in order to run.  
				Come back with a browser that has JavaScript turned on!
			</p>
		</div>

		<div id ="playArea">
			<canvas id="gameCanvas"></canvas>

			<div id="topLevelDisplayArea">
				Level: <span id="topLevelDisplayData">1</span>
			</div>

			<div id="topScoreDisplayArea">
				Score: <span id="topScoreDisplayData">0</span>
			</div>

			<div id="pauseScreen">
				<h3 id="pauseScreenTitle">Game Paused</h3>
				<button id="unpauseButton" disabled>Play Game</button>
				<table id="statsTable">
					<tr>
						<td>Score:</td>
						<td id="scoreData"></td>
					</tr>
					<tr>
						<td>Level:</td>
						<td id="levelData"></td>
					</tr>
					<tr>
						<td>Time:</td>
						<td id="timeData"></td>
					</tr>
					<tr>
						<td>Layers destroyed:</td>
						<td id="layersCollapsedData"></td>
					</tr>
					<tr>
						<td>Squares destroyed:</td>
						<td id="squaresCollapsedData"></td>
					</tr>
					<tr>
						<td>Bonuses used:</td>
						<td id="bonusesUsedData"></td>
					</tr>
				</table>
			</div>

			<div id="playAreaButtons">
				<div id="playAreaButtonsLeftContainer">
					<img id="helpButton" src="img/help.png" alt="help">
				</div>
				<div id="playAreaButtonsRightContainer">
					<img id="musicOnButton" src="img/music_on.png" alt="turn music on">
					<img id="musicOffButton" src="img/music_off.png" alt="turn music off">
					<img id="sfxOnButton" src="img/sfx_on.png" alt="turn sfx on">
					<img id="sfxOffButton" src="img/sfx_off.png" alt="turn sfx off">
				</div>
			</div>
		</div>

		<div id="infoArea">
			<div id="directionsArea">
				<h2>Directions</h2>
				<table id="directionsTable">
					<p>
						Just, like, be awesome.  And win.
					</p>
					<tr>
						<td class="directionPanel">
							<h3>Rotate Block</h3>
							<img src="img/directions_rotate.png" alt="Rotate block">
							<p>Tap on block.<p>
						</td>
						<td class="directionPanel">
							<h3>Move Block Sideways</h3>
							<img src="img/directions_move.png" alt="Move block sideways">
							<p>Press on block, and drag sideways.<p>
						</td>
					</tr>
					<tr>
						<td class="directionPanel">
							<h3>Drop Block</h3>
							<img src="img/directions_drop.png" alt="Drop block">
							<p>Press on block, and drag down (toward fall direction).<p>
						</td>
						<td class="directionPanel">
							<h3>Switch Block Fall Direction</h3>
							<img src="img/directions_switch_fall_direction.png" alt="Switch block fall direction">
							<p>Press on block, and drag up (away from current fall direction).<p>
						</td>
					</tr>
				</table>
				<p>
					Press the spacebar to pause.
				</p>
			</div>

			<hr>

			<div id="optionsArea">
				<h2>Options</h2>
				<p>
					<label><input type="checkbox" name="mode1" id="mode1" value="mode1"> Enable keyboard control</label>
					<br>
					<label><input type="checkbox" name="mode2" id="mode2" value="mode2"> Completing squares instead of lines</label>
					<br>
					<label><input type="checkbox" name="mode3" id="mode3" value="mode3" checked> Blocks are allowed to fall past the center</label>
					<br>
					<label><input type="checkbox" name="mode4" id="mode4" value="mode4" checked> Able to change falling direction of blocks</label>
					<br>
					<label><input type="checkbox" name="mode5" id="mode5" value="mode5" checked> Changing direction moves block to next quadrant</label>
					<br>
					<label><input type="checkbox" name="mode6" id="mode6" value="mode6" checked> Collapsing a layer causes higher layers to &quot;settle&quot;</label>
					<br>
					<label><input type="checkbox" name="mode7" id="mode7" value="mode7" checked> Bombs on</label>
					<br>
					Size of game area:
					<select id="gameWindowSize">
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="40" selected>40</option>
						<option value="60">60</option>
						<option value="80">80</option>
						<option value="100">100</option>
						<option value="120">120</option>
						<option value="140">140</option>
						<option value="160">160</option>
						<option value="180">180</option>
						<option value="200">200</option>
					</select>
					<br>
					Size of center square:
					<select id="centerSquareSize">
						<option value="2">2</option>
						<option value="4">4</option>
						<option value="6" selected>6</option>
						<option value="8">8</option>
						<option value="12">12</option>
						<option value="14">14</option>
						<option value="16">16</option>
						<option value="18">18</option>
						<option value="20">20</option>
					</select>
					<br>
					Starting level:
					<select id="startingLevel">
						<option value="1" selected>1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
						<option value="8">8</option>
						<option value="9">9</option>
						<option value="10">10</option>
						<option value="15">15</option>
						<option value="20">20</option>
					</select>
					<br>
					<label><input type="checkbox" name="showConsole" id="showConsole" value="showConsole"> Show the debug console</label>
				</p>
			</div>

			<hr>

			<div id="musicArea">
				<h2>Music</h2>
				<div class="textColumn">
					<label><input type="checkbox" name="aNightOfDizzySpells" id="aNightOfDizzySpells" value="aNightOfDizzySpells" > A Night Of Dizzy Spells</label>
					<a href="https://soundcloud.com/eric-skiff/a-night-of-dizzy-spells?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="allOfUs" id="allOfUs" value="allOfUs" > All of Us</label>
					<a href="https://soundcloud.com/eric-skiff/all-of-us?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="arpanauts" id="arpanauts" value="arpanauts" > Arpanauts</label>
					<a href="https://soundcloud.com/eric-skiff/arpanauts?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="ascending" id="ascending" value="ascending" > Ascending</label>
					<a href="https://soundcloud.com/eric-skiff/ascending?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="chibiNinja" id="chibiNinja" value="chibiNinja" > Chibi Ninja</label>
					<a href="https://soundcloud.com/eric-skiff/chibi-ninja?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="comeAndFindMeB" id="comeAndFindMeB" value="comeAndFindMeB"> Come and Find Me - B mix</label>
					<a href="https://soundcloud.com/eric-skiff/come-and-find-me-b-mix?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="comeAndFindMe" id="comeAndFindMe" value="comeAndFindMe"> Come and Find Me</label>
					<a href="https://soundcloud.com/eric-skiff/come-and-find-me?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="digitalNative" id="digitalNative" value="digitalNative" > Digital Native</label>
					<a href="https://soundcloud.com/eric-skiff/digital-native?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
				</div>
				<div class="textColumn">
					<label><input type="checkbox" name="hhavokIntro" id="hhavokIntro" value="hhavokIntro"> HHavok-intro</label>
					<a href="https://soundcloud.com/eric-skiff/hhavok-intro?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="hhavokMain" id="hhavokMain" value="hhavokMain" > HHavok-main</label>
					<a href="https://soundcloud.com/eric-skiff/hhavok-main?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="jumpshot" id="jumpshot" value="jumpshot" > Jumpshot</label>
					<a href="https://soundcloud.com/eric-skiff/jumpshot?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="prologue" id="prologue" value="prologue"> Prologue</label>
					<a href="https://soundcloud.com/eric-skiff/prologue?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="searching" id="searching" value="searching" > Searching</label>
					<a href="https://soundcloud.com/eric-skiff/searching?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="underclocked" id="underclocked" value="underclocked" > Underclocked (underunderclocked mix)</label>
					<a href="https://soundcloud.com/eric-skiff/underclocked-underunderclocked?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="wereAllUnderTheStars" id="wereAllUnderTheStars" value="wereAllUnderTheStars"> We're All Under the Stars</label>
					<a href="https://soundcloud.com/eric-skiff/were-all-under-the-stars?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
					<br>
					<label><input type="checkbox" name="wereTheResistors" id="wereTheResistors" value="wereTheResistors" > We're the Resistors</label>
					<a href="https://soundcloud.com/eric-skiff/were-the-resistors?in=eric-skiff/sets/resistor-anthems" target="_blank">(&#9654;)</a>
				</div>
				<br>
				<p>
					All of these pieces are by 
					<a href="http://ericskiff.com/music/" target="_blank">Eric Skiff</a>.
				</p>
			</div>

			<hr>

			<div id="aboutArea">
				<h2>About</h2>
				<p>
					This game was made by <a href="www.jackieandlevi.com/levi.php">Levi Lindsey</a>.
					<br><br>
					The code is open source, and you can find it on GitHub at 
					<a href="https://github.com/levisl176/squared_away" target="_blank">
					https://github.com/levisl176/squared_away</a>.
					<br><br>
					Also, this app is coming soon to the Android marketplace.
				</p>
			</div>
		</div>

		<div id="console">
			<hr>

			<h2>Debug Console:</h2>
		</div>
	</div>

    <script src="http://code.createjs.com/soundjs-0.4.0.min.js"></script>

    <script type="text/javascript" src="js/stacktrace-min-0.4.js"></script>

    <script type="text/javascript" src="js/logger.js"></script>
    <script type="text/javascript" src="js/utils.js"></script>
    <script type="text/javascript" src="js/resources.js"></script>
    <script type="text/javascript" src="js/sprite.js"></script>
    <script type="text/javascript" src="js/block.js"></script>
    <script type="text/javascript" src="js/previewwindow.js"></script>
    <script type="text/javascript" src="js/centersquare.js"></script>
    <script type="text/javascript" src="js/gameWindow.js"></script>
    <script type="text/javascript" src="js/input.js"></script>
    <script type="text/javascript" src="js/game.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
</body>
</html>
