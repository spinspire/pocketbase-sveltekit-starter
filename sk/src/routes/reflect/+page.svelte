<script lang="ts">
    import { metadata } from "$lib/app/stores";
    import { goto } from "$app/navigation";
    import { authModel, save } from "$lib/pocketbase";
    import { alertOnFailure } from "$lib/pocketbase/ui";
    import type { PageData } from "./$types";
    import Markdown from "svelte-markdown";
    
    $: test = "";
    $metadata.title = "reflect";
    $metadata.description = "reflect ai";
    </script>

Coming Soon