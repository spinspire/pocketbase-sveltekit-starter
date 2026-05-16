<script lang="ts">
  import { base, resolve } from "$app/paths";
  import Tabs from "$lib/components/TabGroup.svelte";
  import Tab from "$lib/components/Tab.svelte";
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
  let active = $derived(page.url.searchParams.get("active") ?? "");
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
  <Tabs {active}>
    {#snippet tabs()}
      <a href={resolve("/posts/[slug]", { slug: record.slug || record.id })}>
        <Tab key="view" pathname="/posts/{record.slug || record.id}/">View</Tab>
      </a>
      {#if ($authModel?.id === record.user || client.authStore.isSuperuser) && record.id}
        <a
          href={resolve("/posts/[slug]/edit", {
            slug: record.slug || record.id,
          })}
        >
          <Tab
            key="edit"
            pathname={resolve("/posts/[slug]/edit", {
              slug: record.slug || record.id,
            })}>Edit</Tab
          >
        </a>
        <a
          href={resolve("/posts/[slug]/?active=delete", {
            slug: record.slug || record.id,
          })}
        >
          <Tab
            key="delete"
            pathname={resolve("/posts/[slug]/?active=delete", {
              slug: record.slug || record.id,
            })}>Delete</Tab
          >
        </a>
      {/if}
      <a
        href={resolve("/posts/[slug]/?active=auditlog", {
          slug: record.slug || record.id,
        })}
      >
        <Tab
          key="auditlog"
          pathname={resolve("/posts/[slug]/?active=auditlog", {
            slug: record.slug || record.id,
          })}
        >
          Audit Log
        </Tab>
      </a>
    {/snippet}
    <!-- tab content -->
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
      <!-- default: just render the page we're on -->
      {@render children()}
    {/if}
  </Tabs>
  {#snippet otherwise()}
    <!-- otherwise: just render the page we're on -->
    {@render children()}
  {/snippet}
</LoginGuard>

<style>
  a {
    /* don't color links */
    color: inherit;
  }
</style>
