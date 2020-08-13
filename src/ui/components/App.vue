<template>
	<div @keydown="keyPressed" tabindex="0" autofocus class="container mt-4">
		<div class="buttons">
			<button class="button" @click="newGrid">New Grid</button>
			<button class="button" @click="fullPopulateScratch">Fill Scratch</button>
			<button class="button" @click="help = !help">{{ help ? 'Hide' : 'Show' }} Helpers</button>
			<button class="button" @click="undo" :disabled="!checkpoints.length">Undo</button>
			<div class="buttons has-addons">
				<button class="button" :class="{ 'is-success': pen }" @click="pen = !pen">Pen</button>
				<button class="button" :class="{ 'is-success': !pen }" @click="pen = !pen">Pencil</button>
			</div>
		</div>
		<div v-if="help" class="buttons">
			<button class="button is-warning" @click="findSingles">Find Singles</button>
			<button class="button is-warning" @click="findNakedPairs">Find Naked</button>
			<button class="button is-warning" @click="findPointingPairs">Find Pointing</button>
			<button class="button is-warning" @click="findHiddenPairs">Find Hidden</button>
		</div>
		<div v-if="!playing" class="message is-success">
			<div class="message-header">Puzzle Complete!</div>
			<div class="message-body">Playtime: {{playtime}}</div>
		</div>
		<table class="main-grid table is-bordered" :class="{ pencil: !pen }">
			<tbody>
				<tr v-for="row in this.rows" :key="row._id">
					<td v-for="cell in row" @click="makeCurrent(cell)" @dblclick="promoteScratch(cell)" :key="cell._id" :class="{ locked: cell.locked, current: currentCell === cell, blocked: inHouse(cell), highlight: hasVal(cell, showMatchingValues, showMatchingScratch), single: showSingleScratch && cell.scratch.length === 1, error: hasVal(cell, true, true) && inHouse(cell) && cell !== currentCell }">
						<Cell :cell="cell" ></Cell>
					</td>
				</tr>
			</tbody>
		</table>
		<p class="has-text-centered">Lock Count: {{lockCount}}</p>
		<p v-if="playing" class="has-text-centered mb-4">Playtime: {{playtime}}</p>
		<div class="field is-grouped">
			<p class="control">
				<label class="checkbox">
					<input type="checkbox" v-model="showMatchingValues">Highlight Matching Values
				</label>
			</p>
			<p class="control">
				<label class="checkbox">
					<input type="checkbox" v-model="showMatchingScratch">Highlight Matching Scratches
				</label>
			</p>
			<p class="control">
				<label class="checkbox">
					<input type="checkbox" v-model="showSingleScratch">Highlight Single Scratches
				</label>
			</p>
		</div>
		<div class="box">
			<h1 class="title">Help</h1>
			<ul>
				<li>Click on a square to enter a value</li>
				<li>Press <code>spacebar</code> to switch between pen (main number, pointer cursor) and pencil (scratch area, help cursor). You can also use the buttons.</li>
				<li>Press <code>0-9</code> to enter a number. Enter the number again to clear it in scratch mode.</li>
				<li>Use <code>backspace</code> to clear the value in pen mode</li>
				<li>If a square has only one scratch value left, you can double click the square to enter the value automatically</li>
				<li>Press the <code>Scratch</code> button to automatically fill all scratch areas with possible values</li>
			</ul>
		</div>
	</div>
</template>

<script>
import cell from '../js/cell.js';
import sudoku from '../js/sudoku.js';
import Cell from './Cell.vue';

export default {
	components: {
		Cell
	},
	data: {
		rows: [],
		checkpoints: [],
		currentCell: null,
		pen: true,
		playtime: '',
		playing: true,
		help: false,
		showMatchingValues: true,
		showMatchingScratch: true,
		showSingleScratch: true
	},
	created() {
		this.newGrid();
		this.intervalId = setInterval(() => {
			if ( this.playing ) {
				let seconds = Math.floor((Date.now() - this.startTime)/1000);
				let minutes = ("" + Math.floor(seconds / 60)).padStart(3,'0');
				seconds = ("" + (seconds % 60)).padStart(2,'0');
				this.playtime = minutes + ':' + seconds;
			}
		}, 1000);
	},
	beforeDestroy() {
		clearInterval(this.intervalId);
	},
	computed: {
		lockCount(){
			return this.cells.filter(c => c.locked).length;
		}
	},
	methods: {
		newGrid(){
			this.startTime = Date.now();
			this.playing = true;
			this.currentCell = null;
			this.checkpoints = [];
			this.cells = [];
			this.rows = [];
			let idx = 1;
			for( let i = 0; i < 9; i++ ) {
				let row = [];
				row._id = idx++;
				for( let j = 0; j < 9; j++ ) {
					let c = new cell();
					c._id = idx++;
					c._row = i;
					c._col = j;
					c._region = Math.floor(i/3)*3 + Math.floor(j/3);
					row.push(c);
					this.cells.push(c);
				}
				this.rows.push(row);
			}
			let grid = sudoku.generate(18);
			for( const [key, val] of Object.entries(grid) ) {
				let col = key[0].charCodeAt(0) - 'A'.charCodeAt(0);
				let row = key[1].charCodeAt(0) - '1'.charCodeAt(0);

				this.setInit(row, col, parseInt(val));
			}
		},
		setInit(r,c,v) {
			this.rows[r][c].val = v;
			this.rows[r][c].locked = true;
		},
		makeCurrent(cell){
			this.currentCell = cell;
		},
		promoteScratch(cell){
			if ( cell.scratch.length === 1 ) {
				this.checkpoint();
				cell.val = cell.scratch[0];
				cell.scratch = [];
				this.cleanScratch(cell);
				if ( this.validate() ) {
					this.playing = false;
				}
			}
		},
		inHouse(cell){
			if ( !this.currentCell ) return false;
			return this.currentCell._row === cell._row || this.currentCell._col === cell._col || this.currentCell._region === cell._region;
		},
		hasVal(cell, matchVal, matchScratch){
			if ( !this.currentCell || !this.currentCell.val ) return false;
			return (this.currentCell.val === cell.val && matchVal) || (matchScratch && cell.scratch.indexOf(this.currentCell.val) >= 0);
		},
		keyPressed(ev){
			if ( this.currentCell && !this.currentCell.locked ){
				let val = "0123456789".indexOf(ev.key);
				if ( val > 0) {
					this.checkpoint();
					if ( this.pen ) {
						this.currentCell.val = val;
						this.currentCell.scratch = [];
						this.cleanScratch(this.currentCell);
						if ( this.validate() ) {
							this.playing = false;
						}
					} else {
						if ( this.currentCell.scratch.indexOf(val) >= 0 ) {
							this.currentCell.removeScratch(val);
						} else {
							this.currentCell.addScratch(val)
						}
					}
				} else if ( ev.key === "Backspace" || ev.key === "Delete" ) {
					this.checkpoint();
					this.currentCell.val = null;
				}
			}
			if ( ev.key === " " ) {
				this.pen = !this.pen;
				ev.preventDefault();
				ev.stopPropagation();
				return false;
			}
		},
		fullPopulateScratch() {
			// Naive filling of possible values
			for( let i = 1; i <= 9; i++ ) {
				// First, find all cells where we already have this value
				let filled = this.cells.filter(c => c.val === i);
				// Get any unfilled cells
				let candidates = this.cells.filter(c => !c.val);
				filled.forEach(f => {
					// Remove any cells in the same row/column/region
					candidates = candidates.filter(c => c._row !== f._row);
					candidates = candidates.filter(c => c._col !== f._col);
					candidates = candidates.filter(c => c._region !== f._region);
				});
				// Now scratch in the value for the remaining cells
				candidates.forEach(c => c.addScratch(i));
			}
		},
		findSingles() {
			// Find any scratch values that only appear once in a particular row, column, or region, or are by themselves
			let found = true;
			while(found) {
				found = false;
				for( let i = 1; i <= 9; i++ ) {
					let scratched = this.cells.filter(c => c.scratch.indexOf(i) >= 0);
					scratched.some(c =>{
						if ( scratched.filter(t => t._row === c._row && c !== t).length === 0 ||
							scratched.filter(t => t._col === c._col && c !== t ).length === 0 ||
							scratched.filter(t => t._region === c._region && t !== c ).length === 0 ) {
								found = true;
								c.scratch = [];
								c.val = i;
								this.cleanScratch(c);
						}
						return found;
					});
					if ( found ) break;
				}
				let scratched = this.cells.filter(c => c.scratch.length === 1);
				scratched.some(c => {
					found = true;
					c.val = c.scratch[0];
					c.scratch = [];
					this.cleanScratch(c);
					return found;
				})
			}
		},
		cleanScratch(cell){
			let cleanup = this.cells.filter(c => c._row === cell._row || c._col === cell._col || c._region === cell._region);
			cleanup.forEach(c => c.removeScratch(cell.val));
		},
		findNakedPairs(){
			// Find any naked pairs to reduce scratches elsewhere

				for( let i = 0; i < 9; i++ ) {
					processPairs(this.cells, i, '_row');
					processPairs(this.cells, i, '_col');
					processPairs(this.cells, i, '_region');
				}

			function processPairs( cells, i, area ) {
				let scratched = cells.filter(c => c[area] === i && c.scratch.length === 2 );
				while ( scratched.length >= 2 ) {
					let cmp = scratched.pop();
					if ( cmp.scratch.length === 2 ) {
						for( let j = 0; j < scratched.length; j++ ) {
							
							if ( cmp.compareScratch(scratched[j]) ) {
								// We found a match. Remove the two values in cmp from any other elements in the same vector
								let removals = cells.filter(c => c[area] === i && c !== cmp && c !== scratched[j]);
								removals.forEach(c => {
									c.removeScratch(cmp.scratch[0])
									c.removeScratch(cmp.scratch[1])
								});
							}
						}
					}
				}
			}
		},
		findPointingPairs(){
			// Find any pointing pairs to reduce scratches elsewhere
			// For each region
			for( let i = 0; i < 9; i++ ) {
				// For each value
				for( let j = 1; j <= 9; j++ ) {
					let scratched = this.cells.filter(c => c._region === i && c.scratch.indexOf(j) >= 0 );
					// Do we have two or three?
					if ( scratched.length >= 2 && scratched.length <= 3 ) {
						// Are they all the same row?
						if ( scratched.filter(c => c._row === scratched[0]._row).length === scratched.length ) {
							let removals = this.cells.filter(c => c._row === scratched[0]._row && scratched.indexOf(c) < 0 );
							removals.forEach(c => {
								c.removeScratch(j);
							})
						}
						// Column
						if ( scratched.filter(c => c._col === scratched[0]._col).length === scratched.length ) {
							let removals = this.cells.filter(c => c._col === scratched[0]._col && scratched.indexOf(c) < 0 );
							removals.forEach(c => {
								c.removeScratch(j);
							})
						}
					}
				}
			}
		},
		findHiddenPairs(){
			// For each row, col, region
			findHidden(this.cells, '_row');
			findHidden(this.cells, '_col');
			findHidden(this.cells, '_region')
		
			function findHidden( cells, area ) {
				for( let i = 0; i < 8; i++ ) {
					let scratched = cells.filter(c => c[area] === i && !c.val);
					if ( scratched.length > 2 ) {
						for( let j = 1; j <= 9; j++ ) {
							// Find all cells matching the value
							let hasVal = scratched.filter(c => c.scratch.indexOf(j) >= 0);
							// The cells all have the particular value. Do we have at exactly two
							if ( hasVal.length === 2 ) {
								// Only two cells have this particular value. Do they have one other value in common only in those two?
								for( let k = 1; k <= 9; k++ ) {
									if ( j !== k && hasVal[0].scratch.indexOf(k) >= 0 && hasVal[1].scratch.indexOf(k) >= 0 && scratched.filter(c => c.scratch.indexOf(k) >= 0).length === 2) {
										// Hidden pair found. Remove all other values
										hasVal[0].scratch = [j,k];
										hasVal[1].scratch = [j,k];
										hasVal[0].scratch.sort();
										hasVal[1].scratch.sort();										
									}
								}
							}
						}
					}
				}
			}
		},
		checkpoint(){
			let state = this.cells.map(c => {return {val: c.val, scratch: c.scratch.slice()}})
			this.checkpoints.push(state)
		},
		undo(){
			if ( this.checkpoints.length ) {
				let state = this.checkpoints.pop();
				for( let i = 0; i < this.cells.length; i++ ) {
					this.cells[i].val = state[i].val;
					this.cells[i].scratch = state[i].scratch.slice();
				}
			}
		},
		validate(){
			if ( this.cells.filter(c => c.scratch.length > 0).length ) return false;
			for( let i = 1; i < 9; i++ ) {
				let subset = this.cells.filter(c => c.val === i);
				if ( subset.length !== 9 ) return false;
				if ( subset.map(c => c._row).filter((v, i, self) => self.indexOf(v) === i).length !== 9 ) return false;
				if ( subset.map(c => c._col).filter((v, i, self) => self.indexOf(v) === i).length !== 9 ) return false;
				if ( subset.map(c => c._region).filter((v, i, self) => self.indexOf(v) === i).length !== 9 ) return false;
			}
			return true;
		}
	}
};
</script>

<style scoped>
.main-grid tbody > tr {
	min-height: 80px;
	height: 80px;
}
.main-grid tbody > tr > td {
	min-width: 80px;
	vertical-align: middle;
	text-align: center;
	padding: 0;
}
.buttons {
	justify-content: center;
	align-items: flex-start;
}
.field.is-grouped {
	justify-content: center;
}
.container {
	outline: 0;
}
td {
	user-select: none;
}
td.locked {
	background-color: #eee;
}
td.blocked {
	background-color: lightyellow;
}
td.highlight {
	background-color: lightblue;
}
td.current {
	outline: 2px solid black;
}
td.error {
	outline: 2px solid red;
}
td.single {
	outline: 2px dashed lightblue;
}
.main-grid tbody > tr > td:nth-child(3n) {
	border-right-width: 3px;
}
.main-grid tbody > tr > td:first-child {
	border-left-width: 3px;
}
.main-grid tbody > tr:first-child td {
	border-top-width: 3px;
}
.main-grid tbody > tr:nth-child(3n) td {
	border-bottom-width: 3px;
}
table {
	cursor: pointer;
	margin: auto;
}
.pencil {
	cursor: help;
}
</style>