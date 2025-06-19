<script lang="ts">
  //credit: https://hudecz.medium.com/how-to-create-a-pure-css-toggle-button-2fcc955a8984

  export let optionDefault: string;
  export let optionChecked: string;
  export let checked: boolean = false;
  export let value: string = "";
  $: value = checked ? optionChecked : optionDefault;
</script>

<label>
  <div>{optionDefault}</div>
  <input type="checkbox" bind:checked on:click on:change />
  <div>{optionChecked}</div>
</label>

<style lang="scss">
  label {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    min-width: fit-content;
    border: 3px solid var(--switch-unchecked-color);
    border-radius: var(--main-radius);
    background: var(--switch-unchecked-color);
    font-weight: bold;
    cursor: pointer;
    margin-block: 0em;

    div {
      padding: 0.25em 0.75em;
      text-align: center;
      margin-block: auto;
      z-index: 1;
    }
    input {
      display: none;
    }

    &::before {
      content: "";
      position: absolute;
      width: 50%;
      height: 100%;
      left: 0%;
      border-radius: var(--main-radius);
      background: var(--switch-checked-color);
      transition: all 0.3s;
    }

    &:has(input:checked)::before {
      left: 50%;
    }
  }
</style>
