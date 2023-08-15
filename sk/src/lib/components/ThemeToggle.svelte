<script>
    import { onMount, afterUpdate } from "svelte";
    import { theme } from "../app/themeStore";
  
    /* global feather */

    function toggleTheme() {
      const newTheme = $theme === "theme-dark" ? "theme-light" : "theme-dark";
      $theme = newTheme;
  
      const lightStylesheet = document.getElementById("theme-light-stylesheet");
      const darkStylesheet = document.getElementById("theme-dark-stylesheet");
  
      if (newTheme === "theme-dark") {
        if (darkStylesheet && "media" in darkStylesheet)
          darkStylesheet.media = "all";
        if (lightStylesheet && "media" in lightStylesheet)
          lightStylesheet.media = "none";
      } else {
        if (lightStylesheet && "media" in lightStylesheet)
          lightStylesheet.media = "all";
        if (darkStylesheet && "media" in darkStylesheet)
          darkStylesheet.media = "none";
      }
    }
  
    onMount(() => {
      feather.replace();
    });
  
    afterUpdate(() => {
      feather.replace();
    });
  </script>
  

<nav>
  <button on:click={toggleTheme}><i data-feather="sun" /></button>
</nav>
