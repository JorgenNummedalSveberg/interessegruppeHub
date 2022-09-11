<script>
    let show;
    export let parent;
    export let position;
    export function showToggle() {
        show = !show;
    }
    const positions = {
        above: [0, -50],
        right: [50, 0],
        below: [0, 50],
        left: [-50, 0]
    }
    export let offsetX = 0;
    export let offsetY = 0;
    let node;
    const handleClick = event => {
        if (node && !node.contains(event.target) && parent && !parent.contains(event.target)) {
            show = false
        }
    }
    document.addEventListener('click', handleClick, true);

</script>
    <main bind:this={node} style="left: {parent && position ? parent.offsetLeft + positions[position][0] + offsetX: 0}px; top: {parent && position ? parent.offsetTop + positions[position][1] + offsetY : 0}px; display: {show?'initial':'none'}">
        <slot/>
    </main>
<style>
    main {
        position: absolute;
    }
</style>

