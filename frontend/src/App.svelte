<script>
	import {Router, Route, Link} from "svelte-navigator";
	import Home from './questline/Home/Home.svelte';
	import {OidcContext, LoginButton, LogoutButton, userInfo} from '@dopry/svelte-oidc';
	import BorrowEquipment from "./questline/BorrowEquipment/BorrowEquipment.svelte";
	import AboutUs from "./questline/AbourUs/AboutUs.svelte";
	import {isAuthenticated} from "@dopry/svelte-oidc";
	import MobileHeader from "./common/MobileHeader.svelte";
	import Modal from "./common/Modal.svelte";

	let windowWidth = window.innerWidth;
	window.addEventListener('resize', () => windowWidth = window.innerWidth);


	let loginModal;
	let profileSection;
</script>

<OidcContext
		issuer="https://old.online.ntnu.no/openid/.well-known/openid-configuration"
		client_id="444474"
		redirect_uri="https://questline.web.app/"
		post_logout_redirect_uri="https://questline.web.app/"
>
	<main>
	<Router>
		{#if windowWidth > 768}
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
				<div bind:this={profileSection} class="navItem" on:click={loginModal.showToggle}>
					{#if $isAuthenticated}
						<div class="log-in">
							{$userInfo.name.toUpperCase()}
						</div>
					{/if}
					{#if !$isAuthenticated}
						<div class="log-in">
							NOT LOGGED IN
						</div>
					{/if}
					<img class="profileImage" src="profile-icon.png"  alt="img not found"/>
				</div>
			</nav>
			<Modal bind:this={loginModal} offsetX={20} offsetY={10} parent="{profileSection}" position="below">
				<div class="loginMenu">
					<LoginButton>Login</LoginButton>
					<LogoutButton>Logout</LogoutButton>
				</div>
			</Modal>
		{/if}
		{#if windowWidth <= 768}
			<MobileHeader/>
		{/if}
		<Route path="/">
			<Home/>
		</Route>
		<Route path="/login">
			<Home/>
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

	.loginMenu {
		display: grid;
		grid-template-columns: 1fr 1fr;
		background-color: #0d5474;
		border-radius: 20px;
		margin: 10px;
		overflow: hidden;
	}
	.loginMenu > :global(button) {
		background-color: transparent;
		border: none;
		color: white;
		margin: 0;
		padding: 20px;
	}
	.loginMenu > :global(button):hover {
		background-color: #F9B759;
	}
	.log-in {
		font-size: 13px;
		color: white;
		padding: 20px;
		cursor: pointer;
	}

	.profileImage {
		max-height: 1.5em;
		margin-top: var(--height-prop);
		border-radius: 100px;
		padding: 5px;
	}

	.profileImage:hover {
		background-color: #F9B759;
	}
	.navbar {
		display: flex;
		flex-direction: row;
		align-items: center;
		height: 60px;
		background-color: #0d5474;
		border-radius: 0 0 20px 20px;
		overflow: hidden;
	}
	:global(a) {
		color: #fff;
		text-decoration: none;
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
		text-align: center;
		display: flex;
		align-items: center;
		font-size: 2em;
		height: 100%;
	}

	.navItem:hover {
		background-color: #F9B759;
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
