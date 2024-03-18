<script>
  import { onMount } from "svelte";
  
  let currentTheme = "light";
  
  const themes = [
    "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk",
    "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe",
    "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee",
    "winter", "dim", "nord", "sunset"
  ];
  
  /**
     * @param {string} theme
     */
  function changeTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    currentTheme = theme;
    localStorage.setItem("theme", theme);
  }
  
  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themes.includes(savedTheme)) {
      changeTheme(savedTheme);
    }
  });
  </script>
  
  <div class="dropdown dropdown-end">
    <button class="btn btn-ghost m-1">Theme</button>
    <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
      {#each themes as theme}
      <li>
        <button tabindex="0" class:active={currentTheme === theme} on:click={() => changeTheme(theme)} on:keydown={(event) => event.key === 'Enter' && changeTheme(theme)}>{theme}</button>
      </li>
      {/each}
    </ul>
  </div>