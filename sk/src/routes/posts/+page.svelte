<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import Image from "$lib/components/Image.svelte";
  import { authModel, watch } from "$lib/pocketbase";
  import type { PostsResponse } from "$lib/pocketbase/generated-types";
  import { alertOnFailure } from "$lib/pocketbase/ui";
  import { client } from "$lib/pocketbase";

  async function deleteAllPosts() {
    alertOnFailure(async () => {
      const postsResponse = await client.collection("posts").getList();
      for (const post of postsResponse.items) {
        await client.collection("posts").delete(post.id);
      }
      // Optionally, refresh the posts list or navigate as needed
    });
  }

  $metadata.title = "Recent Posts";
  const posts = watch<PostsResponse>("posts", {
    sort: "-updated",
  });
</script>

<div>
  <span>
    {#if $authModel}
      <a href="new/edit">Create New</a>
    {:else}
      <p>Please login to create new posts.</p>
    {/if}
    <div style="text-align: right;">
      <button on:click={deleteAllPosts}>Delete All Posts</button>
    </div></span
  >
</div>
<hr />
<table>
  <tbody>
    {#each $posts.items as post}
      {#if $authModel?.id == post.user}
        <tr>
          <td>
            {#if post.files && post.files.length > 0}
              <Image
                record={{
                  ...post,
                  $load: () => {},
                  _loadExpand: () => Promise.resolve({}),
                  load: () => Promise.resolve({}),
                  clone: () => ({
                    id: "",
                    created: "",
                    updated: "",
                    load: () =>
                      Promise.resolve({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                    _loadExpand: () =>
                      Promise.resolve({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                    clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    export: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $export: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $isNew: true,
                  }),
                  $clone: () => ({
                    id: "",
                    created: "",
                    updated: "",
                    load: () =>
                      Promise.resolve({ id: "", created: "", updated: "" }),
                    _loadExpand: () =>
                      Promise.resolve({ id: "", created: "", updated: "" }),
                    clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () =>
                        Promise.resolve({ id: "", created: "", updated: "" }),
                      _loadExpand: () =>
                        Promise.resolve({ id: "", created: "", updated: "" }),
                      clone: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      $clone: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      export: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      $export: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      $isNew: true,
                    }),
                    $clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () =>
                        Promise.resolve({ id: "", created: "", updated: "" }),
                      _loadExpand: () =>
                        Promise.resolve({ id: "", created: "", updated: "" }),
                      clone: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      $clone: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      export: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      $export: () => ({
                        id: "",
                        created: "",
                        updated: "",
                        load: () => Promise.resolve({}),
                        _loadExpand: () => Promise.resolve({}),
                        clone: () => ({}),
                        $clone: () => ({}),
                        export: () => ({}),
                        $export: () => ({}),
                        $isNew: true,
                      }),
                      $isNew: true,
                    }),
                    export: () => ({ id: "", created: "", updated: "" }),
                    $export: () => ({ id: "", created: "", updated: "" }),
                    $isNew: true,
                  }),
                  export: () => ({ id: "", created: "", updated: "" }),
                  $export: () => ({ id: "", created: "", updated: "" }),
                  $isNew: false,
                  // Add dummy implementations for any other missing methods
                }}
                alt={post.title}
              />
            {/if}
          </td>
          <td><a href={`${post.slug}`}>{post.title}</a></td>
          <td>{post.updated}</td>
          {#if post.tags}
            {#each post.tags as tag}
              <span class="tag">{tag.trim()}</span>
            {/each}
          {/if}
          <td><a href={`${post.id}/edit`}>Edit</a></td>
          <td><a href={`${post.slug}#delete`}>Delete</a></td>
        </tr>
      {:else}
        <tr>
          <td>
            {#if post.files && post.files.length > 0}
              <Image
                record={{
                  ...post,
                  $load: () => {},
                  _loadExpand: () => Promise.resolve({}),
                  load: () => Promise.resolve({}),
                  clone: () => ({
                    id: "",
                    created: "",
                    updated: "",
                    load: () => Promise.resolve({}),
                    _loadExpand: () => Promise.resolve({}),
                    clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    export: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $export: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $isNew: true,
                  }),
                  $clone: () => ({
                    id: "",
                    created: "",
                    updated: "",
                    load: () => Promise.resolve({}),
                    _loadExpand: () => Promise.resolve({}),
                    clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $clone: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    export: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $export: () => ({
                      id: "",
                      created: "",
                      updated: "",
                      load: () => Promise.resolve({}),
                      _loadExpand: () => Promise.resolve({}),
                      clone: () => ({}),
                      $clone: () => ({}),
                      export: () => ({}),
                      $export: () => ({}),
                      $isNew: true,
                    }),
                    $isNew: true,
                  }),
                  export: () => ({ id: "", created: "", updated: "" }),
                  $export: () => ({ id: "", created: "", updated: "" }),
                  $isNew: false,
                  // Add dummy implementations for any other missing methods
                }}
                file={post.files[0]}
                thumb="100x100"
                alt={post.title}
              />
            {/if}
          </td>
          <td><a href={post.slug}>{post.title}</a></td>

          <td>{post.updated}</td>
          {#if post.tags}
            {#each post.tags as tag}
              <span class="tag">{tag.trim()}</span>
            {/each}
          {/if}
        </tr>
      {/if}
    {:else}
      <tr>
        <td>No posts found.</td>
      </tr>
    {/each}
  </tbody>
</table>
