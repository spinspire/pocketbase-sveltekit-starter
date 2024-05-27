<script lang="ts">
  const { date }: { date: string } = $props();
  // year = dt.getFullYear();
  // dom = dt.getDate();
  // dow = dt.getDay();
  // mon = dt.getMonth();
  const dt = $derived(new Date(date));
  const [dowName, monName, dom, year] = $derived(dt.toDateString().split(" "));
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
