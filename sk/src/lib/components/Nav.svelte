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

<ul class="nav-links unstyled hstack gap-0">
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
  @media (max-width: 768px) {
    .nav-links {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0 var(--space-3);
      align-items: center;
    }
    .nav-links a {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-small);
      width: 100%;
    }
    .nav-links a:hover {
      background-color: var(--muted);
    }
  }
</style>
