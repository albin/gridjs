var PIXEL_SIZE = 25;
var GRID_SIZE = 21;

// we make these available globally
var mark, unmark, resetGrid, colourOf;

(function () {

	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');

	var grid, queue = [];

	var debugSpeed;

	if (typeof window.localStorage !== 'undefined') {
		debugSpeed = parseInt(localStorage.getItem('debugSpeed'));

		if (isNaN(debugSpeed) === true) {
			debugSpeed = 100;

			localStorage.setItem('debugSpeed', debugSpeed);
		}
	}

	// fill a cell
	mark = function (x, y, color) {
		if (typeof x === 'undefined') {
			throw new Error('Argument x missing');
		}

		if (typeof y === 'undefined') {
			throw new Error('Argument y missing');
		}

		if (typeof x !== 'number') {
			throw new Error('Argument x must be a number');
		}

		if (typeof y !== 'number') {
			throw new Error('Argument y must be a number');
		}

		if (typeof color === 'undefined') {
			color = "black";
		}
		else {
			color = color.toLowerCase();
		}

		if (color === '#fff' || color === '#ffffff') {
			// normalise white so it always means unmarked
			color = 'white';
		}

		if (typeof grid[x] !== 'undefined' && typeof grid[x][y] !== 'undefined') {

			queue.push({ x: x, y: y, state: color });

			ready();
		}
	};

	// return a cell to its original state
	unmark = function (x, y) {
		if (typeof x === 'undefined') {
			throw new Error('Argument x missing');
		}

		if (typeof y === 'undefined') {
			throw new Error('Argument y missing');
		}

		if (typeof x !== 'number') {
			throw new Error('Argument x must be a number');
		}

		if (typeof y !== 'number') {
			throw new Error('Argument y must be a number');
		}

		if (typeof grid[x] !== 'undefined' && typeof grid[x][y] !== 'undefined') {

			queue.push({ x: x, y: y, state: "white" });

			ready();
		}
	};

	colourOf = function (x, y) {
		if (typeof x === 'undefined') {
			throw new Error('Argument x missing');
		}

		if (typeof y === 'undefined') {
			throw new Error('Argument y missing');
		}

		if (typeof x !== 'number') {
			throw new Error('Argument x must be a number');
		}

		if (typeof y !== 'number') {
			throw new Error('Argument y must be a number');
		}

		if (typeof grid[x] !== 'undefined' && typeof grid[x][y] !== 'undefined') {
			// if debug mode is active we have to also check the queue whether the cell is marked since the change may not have happened yet
			if (queue.length > 0) {
				var foundAtIndex = -1;

				// find latest change to figure out what the colour of the cell will be once each change is reflected visually
				for (var i = 0; i < queue.length; i++) {
					if (queue[i].x === x && queue[i].y === y) {
						foundAtIndex = i;
					}
				}

				if (foundAtIndex !== -1) {
					return queue[foundAtIndex].state;
				}
			}

			return grid[x][y];
		}

		// no colours outside the grid, return null
		return null;
	};

	// clear grid
	resetGrid = function () {
		grid = [];
		queue = [];

		for (var x = 0; x < GRID_SIZE; x += 1) {
			grid[x] = [];

			for (var y = 0; y < GRID_SIZE; y += 1) {
				grid[x].push("white");
			}
		}

		draw();
	};

	function isDebugging() {
		var debug = document.getElementById('debugging');

		if (debug === null) {
			return false;
		}

		return debug.checked === true;
	}

	var timer = 0;

	function ready() {
		clearTimeout(timer)

		if (isDebugging() === true) {
			timer = setTimeout(draw, debugSpeed);
		}
		else {
			draw();
		}
	}

	var timerSet = false;
	function delayedDraw() {
		timerSet = false;

		draw(true);
	}

	function draw(force) {

		// wait 10ms before running function. stop all other attempts
		// delay draw to improve performance
		if (isDebugging() === false && force !== true) {

			if (timerSet === false) {
				timerSet = true;

				setTimeout(delayedDraw, 10);
			}

			return;
		}



		ctx.clearRect(0, 0, canvas.width, canvas.height);


		var point, color;

		if (isDebugging() === true) {
			if (queue.length > 0) {
				point = queue.shift();

				grid[point.x][point.y] = point.state;
			}
		}
		else {
			for (var q = 0; q < queue.length; q++) {
				point = queue[q];

				grid[point.x][point.y] = point.state;
			}

			queue = [];
		}

		//draw marked cells
		for (x = 0; x < GRID_SIZE; x += 1) {
			for (y = 0; y < GRID_SIZE; y += 1) {
				ctx.fillStyle = grid[x][y];
				ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
			}
		}

		ctx.fillStyle = "black";

		// draw grid x lines
		for (var x = 0; x <= PIXEL_SIZE; x += 1) {
			ctx.fillRect(x * PIXEL_SIZE, 0, 1, canvas.width);
		}
		// draw grid y lines
		for (var y = 0; y <= PIXEL_SIZE; y += 1) {
			ctx.fillRect(0, y * PIXEL_SIZE, canvas.height, 1);
		}

		if (queue.length > 0) {
			ready();
		}
	}


	var debugging = document.getElementById('debugging');
	var debugSpeedInput = document.getElementById('debug-speed');
	var debugSpeedContainer = document.getElementById('debug-speed-container');

	if (debugging !== null && debugSpeedInput !== null && debugSpeedContainer !== null) {
		debugging.addEventListener('change', function () {
			if (this.checked === true) {
				if (typeof window.localStorage !== 'undefined') {
					localStorage.setItem('debugMode', '1');
				}

				debugSpeedContainer.style.display = 'block';
			}
			else {
				if (typeof window.localStorage !== 'undefined') {
					localStorage.setItem('debugMode', '0');
				}

				debugSpeedContainer.style.display = 'none';
			}
		});

		debugSpeedInput.value = debugSpeed;
		debugSpeedInput.addEventListener('input', function () {
			var value = parseInt(this.value);

			if (isNaN(value) === true) {
				debugSpeed = 100;
			}
			else {
				debugSpeed = value;
			}

			if (typeof window.localStorage !== 'undefined') {
				localStorage.setItem('debugSpeed', debugSpeed);
			}
		});
	}

	if (typeof window.localStorage !== 'undefined') {
		if (localStorage.getItem('debugMode') === null) {
			localStorage.setItem('debugMode', '0');
		}

		if (localStorage.getItem('debugMode') === '1') {
			debugging.checked = true;
			debugSpeedContainer.style.display = 'block';
		}
	}



	// show coords
	var coordsX = document.getElementById('coords-x');
	var coordsY = document.getElementById('coords-y');

	if (coordsX !== null) {
		var offsetX = canvas.offsetLeft;
		var offsetY = canvas.offsetTop;

		canvas.addEventListener('mousemove', function (ev) {
			coordsX.innerHTML = Math.floor((ev.pageX - offsetX) / PIXEL_SIZE);
			coordsY.innerHTML = Math.floor((ev.pageY - offsetY) / PIXEL_SIZE);
		});

		canvas.addEventListener('mouseout', function (ev) {
			coordsX.innerHTML = '-';
			coordsY.innerHTML = '-';
		});
	}
})();

// initialize grid
resetGrid();