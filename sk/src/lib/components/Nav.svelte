<script lang="ts">
import { base } from "$app/paths";
import { page } from "$app/stores";
import LoginBadge from "$lib/components/LoginBadge.svelte";
import { authModel } from "$lib/pocketbase";
import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";
import { fly } from "svelte/transition";
let isOpen = false;
const appLinks = [
  ["/create/", "Create"],
  ["/remember/", "Remember"],
  ["/inspire/", "Inspire"],
  ["/explore/", "Explore"],
  ["/reflect/", "Reflect"],
];
const landingLinks = [
  ["/#features", "Features"],
  ["/#how-it-works", "How It Works"],
  ["/#pricing", "Pricing"],
  ["/#testimonials", "Testimonials"],
  ["/#contact", "Contact"],
];
function toggleMenu() {
  isOpen = !isOpen;
}
function closeMenu() {
  isOpen = false;
}
</script>

<nav>
  <div class="navbar">
    <div class="navbar-start">
      <div class="dropdown" on:mouseleave={closeMenu} role="button" aria-haspopup="true" aria-expanded={isOpen} tabindex={0}>
        <button class="btn btn-ghost lg:hidden" on:click={toggleMenu} tabindex="0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </button>
        {#if isOpen}
          <ul
            transition:fly={{ y: -10, duration: 200 }}
            class="menu menu-compact dropdown-content rounded-box bg-base-300 z-20 mt-3 w-52 p-2 shadow"
          >
            {#if $authModel}
              {#each appLinks as [path, label]}
                <li>
                  <a
                    href={`${base}${path}`}
                    class:active={$page.url.pathname === path}
                    on:click={closeMenu}>{label}</a
                  >
                </li>
              {/each}
            {:else}
              {#each landingLinks as [path, label]}
                <li><a href={path} on:click={closeMenu}>{label}</a></li>
              {/each}
            {/if}
          </ul>
        {/if}
      </div>
      <a href="/" class="btn btn-ghost text-xl normal-case">mind.ai</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal p-0">
        {#if $authModel}
          {#each appLinks as [path, label]}
            <li class="p-4">
              <a
                href={`${base}${path}`}
                class:active={$page.url.pathname === path}>{label}</a
              >
            </li>
          {/each}
        {:else}
          {#each landingLinks as [path, label]}
            <li class="p-4"><a href={path}>{label}</a></li>
          {/each}
        {/if}
      </ul>
    </div>
    <div class="navbar-end"><LoginBadge /></div>
  </div>
</nav>
