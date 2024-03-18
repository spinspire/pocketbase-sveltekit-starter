<script lang="ts">
import { metadata } from "$lib/app/stores";
import { goto } from "$app/navigation";
import { authModel, save } from "$lib/pocketbase";
import { alertOnFailure } from "$lib/pocketbase/ui";
import type { PageData } from "./$types";
import Markdown from "svelte-markdown";
import ThemeSwitch from "$lib/components/ThemeSwitch.svelte";

$: test = "";
$metadata.title = "inspire";
$metadata.description = "inspire ai";
</script>

<ThemeSwitch></ThemeSwitch>
Coming Soon
