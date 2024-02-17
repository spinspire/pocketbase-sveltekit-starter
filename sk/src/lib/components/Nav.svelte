<script lang="ts">
import { base } from "$app/paths";
import { page } from "$app/stores";
import LoginBadge from "$lib/components/LoginBadge.svelte";
import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";
const links = [
  ["/", "create"],
  ["/posts/", "remember"],
  ["/hello/", "inspire"],
];
</script>

<nav>
  <div class="navbar bg-base-100">
    <div class="navbar-start">
      <div class="dropdown ">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            /></svg
          >
        </div>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul
          tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100  z-[1] mt-3 w-52 p-2 shadow"
        >
          {#each links as [path, label]}
            {@const active = $page.url.pathname == path}
            <li class="px-2">
              <a href={`${base}${path}`} class:active={active}>{label}</a>
            </li>
          {/each}
        </ul>
      </div>
      <a href="/" class="btn btn-ghost text-xl">modMemory</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        {#each links as [path, label]}
          {@const active = $page.url.pathname == path}
          <li><a href={`${base}${path}`} class:active={active}>{label}</a></li>
        {/each}
      </ul>
    </div>
    <div class="navbar-end">
      <ThemeSwitch></ThemeSwitch>
      <LoginBadge></LoginBadge>
    </div>
  </div>
</nav>

<style>
</style>
