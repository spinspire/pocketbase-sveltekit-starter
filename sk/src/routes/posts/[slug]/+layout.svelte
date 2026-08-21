<script lang="ts">
  import { base, resolve } from "$app/paths";
  import type { Snippet } from "svelte";
  import LoginGuard from "$lib/components/LoginGuard.svelte";
  import { preloadData } from "$app/navigation";
  import AuditPage from "../../auditlog/[coll]/[id]/+page.svelte";
  import type { PageData } from "../../auditlog/[coll]/[id]/$types";
  import Delete from "$lib/components/Delete.svelte";
  import { authModel, client } from "$lib/pocketbase";
  import { metadata } from "$lib/metadata";
  import { page } from "$app/state";

  const { data, children }: { data: any; children: Snippet } = $props();
  const record = $derived(data.record);
  let active = $derived.by(() => {
    const searchActive = page.url.searchParams.get("active");
    if (searchActive) return searchActive;
    const path = page.url.pathname;
    if (path.endsWith("/edit") || path.endsWith("/edit/")) return "edit";
    return "";
  });
  $effect(() => {
    if (active === "auditlog")
      $metadata.title =
        $metadata.headline = `Auditlog: ${record.collectionName}/${record.id}`;
    if (active === "delete")
      $metadata.title =
        $metadata.headline = `Delete: ${record.collectionName}/${record.id}`;
  });
</script>

<LoginGuard>
  <nav class="tabs" data-variant="underline">
    <a
      href={resolve("/posts/[slug]", { slug: record.slug || record.id })}
      data-active={active === "" || undefined}
    >
      View
    </a>
    {#if ($authModel?.id === record.user || client.authStore.isSuperuser) && record.id}
      <a
        href={resolve("/posts/[slug]/edit", {
          slug: record.slug || record.id,
        })}
        data-active={active === "edit" || undefined}
      >
        Edit
      </a>
      <a
        href={resolve("/posts/[slug]/?active=delete", {
          slug: record.slug || record.id,
        })}
        data-active={active === "delete" || undefined}
      >
        Delete
      </a>
    {/if}
    <a
      href={resolve("/posts/[slug]/?active=auditlog", {
        slug: record.slug || record.id,
      })}
      data-active={active === "auditlog" || undefined}
    >
      Audit Log
    </a>
  </nav>

  {#if active === "auditlog"}
    {#await preloadData(resolve( "/auditlog/[coll]/[id]", { coll: record.collectionName, id: record.id } )) then result}
      {#if result.type === "loaded" && result.status === 200}
        <AuditPage data={result.data as PageData} />
      {:else}
        something went wrong!
      {/if}
    {/await}
  {:else if active === "delete"}
    <Delete
      id={record.id}
      table={record.collectionName}
      return_path="../.."
    />
  {:else}
    {@render children()}
  {/if}

  {#snippet otherwise()}
    {@render children()}
  {/snippet}
</LoginGuard>

<style>
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--border);
    margin-block-end: var(--space-4);
  }
  .tabs a {
    padding: var(--space-3) var(--space-4);
    color: var(--muted-foreground);
    text-decoration: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: color 0.15s, border-color 0.15s;
  }
  .tabs a:hover {
    color: var(--foreground);
  }
  .tabs a[data-active] {
    color: var(--primary);
    border-bottom-color: var(--primary);
    font-weight: 600;
  }
</style>
