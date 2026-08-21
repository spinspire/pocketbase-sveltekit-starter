<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/stores";
  const links = [
    ["/", "Home"],
    ["/posts/", "Posts"],
    ["/hello/", "Hello"],
    ["/ref-ui/", "UI Reference"],
  ];
</script>

<ul class="unstyled hstack gap-0">
  {#each links as [path, label]}
    {@const active = $page.url.pathname === path}
    <li>
      <a href={resolve(path)} class="ghost" aria-current={active ? "page" : undefined}>
        {label}
      </a>
    </li>
  {/each}
</ul>

<style>
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  a[aria-current="page"] {
    font-weight: var(--font-bold);
    text-decoration: underline;
    text-underline-offset: var(--space-1);
  }
</style>
