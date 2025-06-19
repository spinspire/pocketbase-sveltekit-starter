<script lang="ts">
  // choices are a map of keys (string labels) and values (any)
  // if you just have strings, use {"foo", "bar", "lum"}
  export let choices: { [key: string]: any } | string[];
  export let value: any = undefined;

  $: {
    if (Array.isArray(choices)) {
      choices = Object.fromEntries(choices.map((k: string) => [k, k]));
    }
  }
</script>

<div>
  {#each Object.entries(choices) as [key, val]}
    <label>
      <input type="radio" value={val} bind:group={value} />
      <span>{key}</span>
    </label>
  {/each}
</div>

<style lang="scss">
  div {
    display: flex;
    gap: 0.25em;
    width: fit-content;
    border: 3px solid var(--switch-unchecked-color);
    border-radius: var(--main-radius);
    background-color: var(--switch-unchecked-color);

    label {
      padding: 0.25em 0.75em;
      margin-bottom: 0;
      cursor: pointer;
      border-radius: var(--main-radius);
      transition: background-color 0.3s;
      font-weight: bold;
      align-content: center;
      text-align: center;

      input {
        display: none; /* hide the radio input */
      }

      &:has(input:checked) {
        background-color: var(--switch-checked-color);
      }

      &:hover:not(:has(input:checked)) {
        background-color: var(--switch-checked-color);
        // darken the selected color
        background-image: linear-gradient(rgb(0 0 0/30%) 0 0);
      }
    }
  }
</style>
