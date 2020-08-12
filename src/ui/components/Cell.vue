<template>
	<div>
        <div class="picked" v-if="cell.val">{{cell.val}}</div>
        <table class="table scratch" v-if="!cell.val">
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
    font-size: xx-small;
}
.scratch td {
    border: 0;
}
.picked {
    font-size: x-large;
    font-weight: bold;
}
</style>