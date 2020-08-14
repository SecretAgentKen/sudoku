<template>
	<div class="cell">
        <div class="picked" v-if="cell.val">{{cell.val}}</div>
        <table class="table scratch is-fullwidth" v-if="!cell.val">
            <tbody>
                <tr>
                    <td><span v-if="has(1)">1</span></td>
                    <td><span v-if="has(2)">2</span></td>
                    <td><span v-if="has(3)">3</span></td>
                </tr>
                <tr>
                    <td><span v-if="has(4)">4</span></td>
                    <td><span v-if="has(5)">5</span></td>
                    <td><span v-if="has(6)">6</span></td>
                </tr>
                <tr>
                    <td><span v-if="has(7)">7</span></td>
                    <td><span v-if="has(8)">8</span></td>
                    <td><span v-if="has(9)">9</span></td>
                </tr>
            </tbody>
        </table>
	</div>
</template>
<script>
export default {
    props: {
        cell: null
    },
    methods: {
        has(v) {
            return this.cell.scratch.indexOf(v) >= 0;
        }
    }
};
</script>
<style scoped>
table.scratch {
    background-color: transparent;
    height: 100%;
}
.scratch td {
    border: 0;
    padding: 0;
    min-width: .5rem;
    min-height: .5rem;
    font-size: .5rem;
}
@media screen and (min-width: 600px) {
    .scratch td {
        min-width: .8rem;
        min-height: .8rem;
        font-size: .8rem;
    }
}
div.cell {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.picked {
    font-size: x-large;
    font-weight: bold;
}
</style>