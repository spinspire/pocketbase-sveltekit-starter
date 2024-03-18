<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import LoginBadge from "$lib/components/LoginBadge.svelte";
  import { authModel } from "$lib/pocketbase";

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
</script>

<nav>
  <div class="navbar bg-base-100">
    <div class="navbar-start">
      <details class="dropdown">
        <summary class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </summary>
        <ul class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
          {#if $authModel}
            {#each appLinks as [path, label]}
              <li>
                <a href={`${base}${path}`} class:active="{$page.url.pathname === path}">{label}</a>
              </li>
            {/each}
          {:else}
            {#each landingLinks as [path, label]}
              <li>
                <a href={path}>{label}</a>
              </li>
            {/each}
          {/if}
        </ul>
      </details>
      <a href="/" class="btn btn-ghost normal-case text-xl">mind.ai</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal p-0">
        {#if $authModel}
          {#each appLinks as [path, label]}
            <li>
              <a href={`${base}${path}`} class:active="{$page.url.pathname === path}">{label}</a>
            </li>
          {/each}
        {:else}
          {#each landingLinks as [path, label]}
            <li>
                <a href={path}>{label}</a>
            </li>
          {/each}
        {/if}
      </ul>
    </div>
    <div class="navbar-end">
      <LoginBadge />
    </div>
  </div>
</nav>
