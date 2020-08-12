<template>
	<div @keyup="keyPressed" tabindex="0">
		<div>
			<a href="#" @click="restore(state)" v-for="state in checkpoints">Restore</a>
		</div>
		<button class="button" @click="fullPopulateScratch">Scratch</button>
		<button class="button" @click="findSingles">Find Singles</button>
		<button class="button" @click="findNakedPairs">Find Naked</button>
		<button class="button" @click="findPointingPairs">Find Pointing</button>
		<button class="button" @click="findHiddenPairs">Find Hidden</button>
		<button class="button" @click="checkpoint">Checkpoint</button>
		<table class="main-grid table is-bordered">
			<tbody>
				<tr v-for="row in this.rows" :key="row._id">
					<td v-for="cell in row" :key="cell._id" :class="{ locked: cell.locked, current: currentCell === cell }" @click="makeCurrent(cell)">
						<Cell :cell="cell" ></Cell>
					</td>
				</tr>
			</tbody>
		</table>
		
	</div>
</template>

<script>
import cell from '../js/cell.js';
import Cell from './Cell.vue';

export default {
	components: {
		Cell
	},
	data: {
		rows: [],
		checkpoints: [],
		currentCell: null
	},
	created() {
		this.cells = [];
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
		}/*
		this.setInit(0,2,8);
		this.setInit(0,4,6);
		this.setInit(0,5,4);
		this.setInit(1,0,6)
		this.setInit(1,8,8)
		this.setInit(2,2,9)
		this.setInit(2,3,5)
		this.setInit(2,6,1)
		this.setInit(2,8,3)
		this.setInit(3,1,2)
		this.setInit(3,5,6)
		this.setInit(3,6,3)
		this.setInit(3,7,7)
		this.setInit(4,0,1)
		this.setInit(4,8,4)
		this.setInit(5,1,6)
		this.setInit(5,2,7)
		this.setInit(5,3,4)
		this.setInit(5,7,8)
		this.setInit(6,0,8)
		this.setInit(6,2,1)
		this.setInit(6,5,7)
		this.setInit(6,6,2)
		this.setInit(7,0,5)
		this.setInit(7,8,9)
		this.setInit(8,3,8)
		this.setInit(8,4,1)
		this.setInit(8,6,7)*/
		/*
		this.setInit(0,1,1);
		this.setInit(0,4,3);
		this.setInit(0,5,8);
		this.setInit(0,7,6);
		this.setInit(1,5,1);
		this.setInit(1,7,4);
		this.setInit(1,8,5);
		this.setInit(2,0,5);
		this.setInit(2,1,9);
		this.setInit(3,3,3);
		this.setInit(3,4,9);
		this.setInit(3,6,1);
		this.setInit(4,0,6);
		this.setInit(4,1,5);
		this.setInit(5,3,1);
		this.setInit(5,4,6);
		this.setInit(5,7,2);
		this.setInit(6,3,6);
		this.setInit(6,4,1);
		this.setInit(6,5,4);
		this.setInit(7,2,7);
		this.setInit(8,6,8);
		this.setInit(8,8,9);*/
		/* Bad?
		this.setInit(0,3,8);
		this.setInit(0,5,1);
		this.setInit(1,6,4);
		this.setInit(1,7,3);
		this.setInit(2,0,5);
		this.setInit(3,4,7);
		this.setInit(3,6,8);
		this.setInit(4,6,1);
		this.setInit(5,1,2);
		this.setInit(5,4,3);
		this.setInit(6,0,6);
		this.setInit(6,7,7);
		this.setInit(6,8,5);
		this.setInit(7,2,3)
		this.setInit(7,3,4);
		this.setInit(8,3,2);
		this.setInit(8,6,6);*/
		this.setInit(0,3,7)
		this.setInit(1,0,1);
		this.setInit(2,3,4);
		this.setInit(2,4,3);
		this.setInit(2,6,2);
		this.setInit(3,8,6);
		this.setInit(4,3,5);
		this.setInit(4,5,9)
		this.setInit(5,6,4)
		this.setInit(5,7,1)
		this.setInit(5,8,8)
		this.setInit(6,4,8)
		this.setInit(6,5,1)
		this.setInit(7,2,2)
		this.setInit(7,7,5)
		this.setInit(8,1,4)
		this.setInit(8,6,3)

	},
	methods: {
		setInit(r,c,v) {
			this.rows[r][c].val = v;
			this.rows[r][c].locked = true;
		},
		makeCurrent(cell){
			this.currentCell = cell;
		},
		keyPressed(ev){
			if ( this.currentCell ){
				let val = "0123456789".indexOf(ev.key);
				if ( val > 0) {
					this.currentCell.val = val;
					this.currentCell.scratch = [];
					this.cleanScratch(this.currentCell);
				} else if ( ev.key === "Backspace" || ev.key === "Delete" ) {
					this.currentCell.val = null;
				}
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
				console.log('Looping')
				found = false;
				for( let i = 1; i <= 9; i++ ) {
					console.log('Looking for',i);
					let scratched = this.cells.filter(c => c.scratch.indexOf(i) >= 0);
					scratched.some(c =>{
						if ( scratched.filter(t => t._row === c._row && c !== t).length === 0 ||
							scratched.filter(t => t._col === c._col && c !== t ).length === 0 ||
							scratched.filter(t => t._region === c._region && t !== c ).length === 0 ) {
								found = true;
								console.log('Found',c._row,c._col);
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
					console.log('Found lonely', c._row, c._col);
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
				console.log('Checking', area, i);
				let scratched = cells.filter(c => c[area] === i && c.scratch.length === 2 );
				while ( scratched.length >= 2 ) {
					let cmp = scratched.pop();
					if ( cmp.scratch.length === 2 ) {
						for( let j = 0; j < scratched.length; j++ ) {
							
							if ( cmp.compareScratch(scratched[j]) ) {
								console.log('Found',cmp.scratch)
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
				console.log('Checking region', i)
				// For each value
				for( let j = 1; j <= 9; j++ ) {
					let scratched = this.cells.filter(c => c._region === i && c.scratch.indexOf(j) >= 0 );
					// Do we have two or three?
					if ( scratched.length >= 2 && scratched.length <= 3 ) {
						// Are they all the same row?
						if ( scratched.filter(c => c._row === scratched[0]._row).length === scratched.length ) {
							console.log('Found row', scratched[0]._row,'for',j)
							let removals = this.cells.filter(c => c._row === scratched[0]._row && scratched.indexOf(c) < 0 );
							removals.forEach(c => {
								c.removeScratch(j);
							})
						}
						// Column
						if ( scratched.filter(c => c._col === scratched[0]._col).length === scratched.length ) {
							console.log('Found col', scratched[0]._col,'for',j)
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
		restore(state){
			for( let i = 0; i < this.cells.length; i++ ) {
				this.cells[i].val = state[i].val;
				this.cells[i].scratch = state[i].scratch.slice();
			}
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
}
td.locked {
	background-color: #eee;
}
td.current {
	outline: 2px solid black;
}
td.error {
	outline: 2px solid red;
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
</style>