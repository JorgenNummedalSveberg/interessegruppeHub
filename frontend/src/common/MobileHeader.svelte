<script>
    import {Link} from "svelte-navigator";
    import {LoginButton, LogoutButton, userInfo} from '@dopry/svelte-oidc';
    import {isAuthenticated} from "@dopry/svelte-oidc";

    let windowWidth = window.innerWidth;
    window.addEventListener('resize', () => windowWidth = window.innerWidth);

    let hamburger = false;
</script>
<nav class="navbar">
    <Link to="/"><img class="logo" src="logo.png" alt="img not found"/></Link>
    <div class="hamburger" on:click={() => hamburger = !hamburger}>
        =
        {#if hamburger}
            <div class="dropdown">
                <Link to="/">QUESTMATCH</Link>
                <Link to="/borrowEquipment">BORROW EQUIPMENT</Link>
                <Link to="/aboutUs">ABOUT US</Link>
                <div class="login">
                    {#if $isAuthenticated}
                        <b>{$userInfo.name}</b>
                        <LogoutButton>Logout</LogoutButton>
                    {/if}
                    {#if !$isAuthenticated}
                        <b>You're not logged in</b>
                        <LoginButton>Login</LoginButton>
                    {/if}
                </div>
            </div>
        {/if}
    </div>
</nav>
<style>
    .navbar {
        background-color: #0d5474;
        display: flex;
        width: 100%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 8px;
    }

    .logo {
        height: 50px;
    }

    .hamburger {
        width: 50px;
        height: 50px;
        font-size: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        position: relative;
    }
    .dropdown {
        z-index: 10;
        position: absolute;
        display: flex;
        flex-direction: column;
        background-color: #0d5474;
        color: black;
        right: 0;
        top: 50px;
        width: 98vw;
        font-family:  "Source Sans Pro", sans-serif;
        font-size: 20px;
    }

    .login {
        padding: 10px;
        display: flex;
        flex-direction: column;
    }

</style>
