<script>
    export let height;
    export let width;

    let overImage = false;
    let overMenu = false;

    let hide = "hidden";

    window.addEventListener("click", () => {
        if (overImage) {
            showHide();
        } else if (!overMenu) {
            hide = "hidden";
        }
    })

    function showHide() {
        hide = hide === "hidden" ? "visible" : "hidden";
    }

</script>
<div style="--hide-prop: {hide}; --height-prop: {height}; --width-prop: {width}"  class="flex">
    <img on:mouseenter={_ => overImage = true} on:mouseleave={_ => overImage = false} class="profileImage" src="profile-icon.png"  alt="img not found"/>
    <div on:mouseenter={_ => overMenu = true} on:mouseleave={_ => overMenu = false} class="clickableMenu">
        <slot class="hiddenItems"/>
    </div>
</div>
<style>
    .flex {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    .clickableMenu {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
        visibility: var(--hide-prop);
        height: var(--height-prop);
        width: var(--width-prop);
        background-color: white;
        box-shadow: 0.1em 0.1em 0.4em 0;
        border-radius: 0.2em;
        font-size: 0.7em;
    }

    .clickableMenu > :global(button) {
        max-width: 45%;
        margin: 0.1em;
    }

</style>
