<script>
import { onMount } from "svelte";

/**
 * @param {string} theme
 */
function changeTheme(theme) {
  console.log(`Changing theme to: ${theme}`); // This should log when a theme is clicked
  document.documentElement.setAttribute("data-theme", theme);
}

onMount(() => {
  const themeLinks = document.querySelectorAll(".theme-link");

  themeLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      if (event.target instanceof HTMLElement) {
        const theme = event.target.getAttribute("data-theme");
        if (theme) {
          changeTheme(theme);
        }
      }
    });
  });

  // Apply the saved theme from localStorage if it exists
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    changeTheme(savedTheme);
  }
});
</script>

<details class="dropdown dropdown-hover">
  <summary tabindex="0" class="btn m-1">Theme</summary>
  <ul
    tabindex="0"
    class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
  >
    <li><a class="theme-link" data-theme="light">Light</a></li>
    <li><a class="theme-link" data-theme="dark">Dark</a></li>
    <li><a class="theme-link" data-theme="cupcake">Cupcake</a></li>
    <li><a class="theme-link" data-theme="bumblebee">Bumblebee</a></li>
    <li><a class="theme-link" data-theme="emerald">Emerald</a></li>
    <li><a class="theme-link" data-theme="corporate">Corporate</a></li>
    <li><a class="theme-link" data-theme="synthwave">Synthwave</a></li>
    <li><a class="theme-link" data-theme="retro">Retro</a></li>
    <li><a class="theme-link" data-theme="cyberpunk">Cyberpunk</a></li>
    <li><a class="theme-link" data-theme="valentine">Valentine</a></li>
    <li><a class="theme-link" data-theme="halloween">Halloween</a></li>
    <li><a class="theme-link" data-theme="garden">Garden</a></li>
    <li><a class="theme-link" data-theme="forest">Forest</a></li>
    <li><a class="theme-link" data-theme="aqua">Aqua</a></li>
    <li><a class="theme-link" data-theme="lofi">Lofi</a></li>
    <li><a class="theme-link" data-theme="pastel">Pastel</a></li>
    <li><a class="theme-link" data-theme="fantasy">Fantasy</a></li>
    <li><a class="theme-link" data-theme="wireframe">Wireframe</a></li>
    <li><a class="theme-link" data-theme="black">Black</a></li>
    <li><a class="theme-link" data-theme="luxury">Luxury</a></li>
    <li><a class="theme-link" data-theme="dracula">Dracula</a></li>
    <li><a class="theme-link" data-theme="cmyk">CMYK</a></li>
    <li><a class="theme-link" data-theme="autumn">Autumn</a></li>
    <li><a class="theme-link" data-theme="business">Business</a></li>
    <li><a class="theme-link" data-theme="acid">Acid</a></li>
    <li><a class="theme-link" data-theme="lemonade">Lemonade</a></li>
    <li><a class="theme-link" data-theme="night">Night</a></li>
    <li><a class="theme-link" data-theme="coffee">Coffee</a></li>
    <li><a class="theme-link" data-theme="winter">Winter</a></li>
    <li><a class="theme-link" data-theme="dim">Dim</a></li>
    <li><a class="theme-link" data-theme="nord">Nord</a></li>
    <li><a class="theme-link" data-theme="sunset">Sunset</a></li>
  </ul>
</details>
