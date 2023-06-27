<script lang="ts">
  export let date: string;
  let dt: Date,
    // year: number,
    // dom: number,
    // dow: number,
    // mon: number,
    year: string,
    dom: string,
    dowName: string,
    monName: string;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  $: {
    dt = new Date(date);
    // year = dt.getFullYear();
    // dom = dt.getDate();
    // dow = dt.getDay();
    // mon = dt.getMonth();
    [dowName, monName, dom, year] = dt.toDateString().split(" ");
  }
</script>

<div class="date" title={dt.toLocaleString()}>
  <div class="dow">{dowName}</div>
  <div>
    <div class="mon">{monName}</div>
    <div class="dom">{dom}</div>
  </div>
  <div class="year">{year}</div>
</div>

<style lang="scss">
  .date {
    display: inline-flex;
    background-color: var(--border);
    border-radius: 50%;
    height: 5em;
    aspect-ratio: 1;
    padding: 0.5em;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-family: var(--font-alt);
    > div {
      display: flex;
      flex-direction: row;
      gap: 0.25em;
      > * {
        font-weight: bold;
      }
    }
  }
</style>
