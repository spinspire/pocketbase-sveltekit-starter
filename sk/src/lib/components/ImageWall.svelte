<script lang="ts">
    import { onMount } from "svelte";
    import { client } from "$lib/pocketbase";
    import type { ImagesResponse } from "$lib/pocketbase/generated-types";
  
    let images: ImagesResponse[] = [];
    let imageWallList: string[] = [];
  
    onMount(async () => {
      const result = await client.collection("images").getList(1, 50);
      images = result.items as ImagesResponse[];
      updateImageWallList(images);
    });
  
    function updateImageWallList(images: ImagesResponse[]) {
      imageWallList = images
        .filter((image) => image.file)
        .map((image) => client.files.getUrl(image, image.file!));
    }
  
    $: updateImageWallList(images);
  </script>
  
  <div class="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {#each imageWallList as pic}
      <img src={pic} alt="Background" class="w-full h-auto" />
    {/each}
  </div>