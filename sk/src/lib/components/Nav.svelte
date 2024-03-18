<script lang="ts">
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import LoginBadge from "$lib/components/LoginBadge.svelte";
  
  const links = [
    ["/create/", "create"],
    ["/remember/", "remember"],
    ["/inspire/", "inspire"],
    ["/explore/", "explore"],
    ["/reflect/", "reflect"],
  ];
  </script>
  
  <nav>
    <div class="navbar bg-base-100">
      <div class="navbar-start">
        <div class="dropdown">
          <input type="checkbox" id="menu-toggle" class="hidden" />
          <label for="menu-toggle" class="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
            {#each links as [path, label]}
              <li>
                <a href={`${base}${path}`} class:active={$page.url.pathname === path}>{label}</a>
              </li>
            {/each}
          </ul>
        </div>
        <a href="/" class="btn btn-ghost normal-case text-xl">mind</a>
      </div>
      <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal px-1">
          {#each links as [path, label]}
            <li>
              <a href={`${base}${path}`} class:active={$page.url.pathname === path}>{label}</a>
            </li>
          {/each}
        </ul>
      </div>
      <div class="navbar-end">
        <LoginBadge />
      </div>
    </div>
  </nav>