export default class Cell {
    constructor(val) {
        this.val = null;
        this.locked = false;
        this.scratch = [];

        if ( val ) {
            this.val = val;
            this.locked = true;
        }
    }

    addScratch(val){
        if ( this.scratch.indexOf(val) < 0 ) this.scratch.push(val);
        this.scratch = this.scratch.sort();
    }

    removeScratch(val) {
        if ( this.scratch.indexOf(val) >= 0 ) this.scratch = this.scratch.filter((v)=>{return val !== v;});
        this.scratch = this.scratch.sort();
    }

    compareScratch(cell) {
        if ( this.scratch.length !== cell.scratch ) return false;
        for( let i = 0; i < this.scratch.length; i++ ){
            if ( this.scratch[i] !== cell.scratch[i] ) return false;
        }
        return true;
    }
}