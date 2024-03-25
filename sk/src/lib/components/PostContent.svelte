<script lang="ts">
    import { marked } from "marked";
  
    export let content: string;
  </script>
  
  <div class="mt-4">
    {@html marked(content || "")}
  </div>