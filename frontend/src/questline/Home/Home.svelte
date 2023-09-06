<script>
    import {initializeApp} from "firebase/app";
    import {getAnalytics} from "firebase/analytics";
    import {getDatabase} from "firebase/database";
    import QuestBoard from "./Components/QuestBoard.svelte";
    import CampaignForm from "./Components/CampaignForm.svelte";

    const firebaseConfig = {
        apiKey: "AIzaSyAibYt3NYopvfkhgHoJnYqGwLW-WaUjkoo",
        authDomain: "questmatch-86f27.firebaseapp.com",
        databaseURL: "https://questmatch-86f27-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "questmatch-86f27",
        storageBucket: "questmatch-86f27.appspot.com",
        messagingSenderId: "200833047382",
        appId: "1:200833047382:web:6ccc671ed10031b79a54f7",
        measurementId: "G-WF1BDT5448"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const database = getDatabase();

	let windowWidth = window.innerWidth;
	window.addEventListener('resize', () => windowWidth = window.innerWidth);
    
</script>
<main>
    <div class="quest-lists">
        {#if windowWidth <= 768}
        <CampaignForm app={app} analytics={analytics} database={database}/>
        {/if}
        <QuestBoard path="upcoming" app={app} analytics={analytics} database={database}/>
        <QuestBoard path="ongoing" app={app} analytics={analytics} database={database}/>
        <QuestBoard path="completed" app={app} analytics={analytics} database={database}/>
    </div>
    {#if windowWidth > 768}
    <CampaignForm app={app} analytics={analytics} database={database}/>
    {/if}
</main>

<style>
    .quest-lists {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    main {
        display: grid;
        align-items: flex-start;
        grid-template-columns: 3fr 1fr;
    }

    @media only screen and (max-width: 768px) {
        /* For mobile phones: */
        main {
            flex-direction: column;
        }
    }

</style>
