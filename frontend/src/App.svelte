<script>
	import {Router, Route, Link} from "svelte-navigator";
	import Home from './Home.svelte';
	import {OidcContext, LoginButton, LogoutButton, userInfo} from '@dopry/svelte-oidc';
	import Profile from "./Profile.svelte";
	import BorrowEquipment from "./BorrowEquipment.svelte";
	import AboutUs from "./AboutUs.svelte";
	import {isAuthenticated} from "@dopry/svelte-oidc";
	import ClickableMenu from "./ClickableMenu.svelte";


</script>

<OidcContext
		issuer="https://old.online.ntnu.no/openid/.well-known/openid-configuration"
		client_id="444474"
		redirect_uri="https://questline.web.app/"
		post_logout_redirect_uri="https://questline.web.app/"
>
	<main>
	<Router>
		<nav class="navbar">
			<div class="navItem">
				<Link to="/"><img class="logo" src="logo.png" alt="img not found"/></Link>
			</div>
			<div class="navItem rightDivider">
				<Link to="/">QUESTMATCH</Link>
			</div>
			<div class="navItem rightDivider">
				<Link to="/borrowEquipment">BORROW EQUIPMENT</Link>
			</div>
			<div class="navItem">
				<Link to="/aboutUs">ABOUT US</Link>
			</div>
			<div class="navItem">
				<ClickableMenu height="150px" width="250px">
					{#if $isAuthenticated}
						<b>{$userInfo.name}</b>
						<LogoutButton>Logout</LogoutButton>
					{/if}
					{#if !$isAuthenticated}
						<b>You're not logged in</b>
						<LoginButton>Login</LoginButton>
					{/if}
				</ClickableMenu>
			</div>
		</nav>
		<Route path="/">
			<Home/>
		</Route>
		<Route path="/login">
			<Home/>
		</Route>
		<Route path="/profile">
			<Profile/>
		</Route>
		<Route path="/borrowEquipment">
			<BorrowEquipment/>
		</Route>
		<Route path="/aboutUs">
			<AboutUs/>
		</Route>
	</Router>
	</main>
</OidcContext>

<style>
	.navbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 60px;
		width: 1000px;
		/*background-color: #d9d9d9;*/
		background-image: repeating-linear-gradient(90deg, #0d3454, #0d3454 3px, transparent 3px, transparent 120px,#0d3454 120px, #0d3454 123px, transparent 123px, transparent 917px, #0d3454 917px, #0d3454 920px, transparent 920px, transparent 1000px ),
		repeating-linear-gradient(#0d5474, #0d5474 28px, #0d3454 28px, #0d3454 30px);
		background-size: cover, cover;
		background-position: 0 0, 0 0;
	}
	:global(a) {
		color: #fff;
		text-decoration: none;
		font-family:  "Source Sans Pro", sans-serif;
		font-size: 13px;
		padding: 10px;
		margin: 0 5px;
		transition: opacity 0.2s;
	}
	.navbar > :global(:nth-last-child(1)) {
		margin-left: auto;
	}
	.navItem {
		padding-left: 15px;
		padding-right: 15px;
		max-height: 100%;
		text-align: center;
		display: flex;
		align-items: center;
		font-size: 2em;
	}
	.navItem > :global(button) {
		height: 1px;
	}
	.logo {
		vertical-align: middle;
		max-height: 4em;
		display:block;
		margin:auto;
	}
	main {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		align-items: center;
	}
</style>
