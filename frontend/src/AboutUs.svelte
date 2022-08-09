<script>
    // function waitForFlex() {
    //     const items = document.getElementsByClassName("flexItem");
    //     if (items.length === 0) {
    //         setTimeout(waitForFlex, 100);
    //     } else {
    //         let maxWidth = 0;
    //         console.log(items);
    //         for (let i = 0; i < items.length; i++) {
    //             if (items[i].offsetWidth > maxWidth) {
    //                 maxWidth = items[i].offsetWidth;
    //             }
    //             console.log(items[i].offsetWidth)
    //         }
    //         for (let i = 0; i < items.length; i++) {
    //             items[i].style.width = maxWidth + "px";
    //         }
    //
    //     }
    // }
    // waitForFlex();

</script>
<main>
    <h2 class="flexItem">Questline</h2>
    <p class="flexItem">
        Vi leier ut utstyr for å spille brettspill, og har hovedsakelig utstyr og bøker for DnD.
    </p>
    <p class="flexItem">
        We rent out equipment(for free) to play tabeltop games, and mainly have books and resources for DnD.
    </p>
</main>
<style>
    main {
        display: flex;
        flex-direction:column;
        align-items: center;
    }
</style>

