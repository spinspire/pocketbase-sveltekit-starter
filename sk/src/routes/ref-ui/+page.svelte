<script lang="ts">
  import Alerts from "$lib/components/Alerts.svelte";
  import { alerts } from "$lib/alerts";
  import Dialog from "$lib/components/Dialog.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import { metadata } from "$lib/metadata";

  $effect(() => {
    $metadata = {
      title: "UI Reference",
      description: "How this project uses oat-css",
      headline: "UI Reference",
    };
  });

  let progressValue = $state(60);
</script>

<p>
  This project uses <a href="https://oat.ink/demo/" target="_blank" rel="noopener">oat-css</a>
  as its UI framework. Below are the patterns and customizations specific to this starter.
  For the full component catalog, see the
  <a href="https://oat.ink/demo/" target="_blank" rel="noopener">official oat demo</a>.
</p>

<!-- Custom theme -->
<section>
  <h2>Custom Theme</h2>
  <p>
    Brand colors are defined in <code>app.scss</code> using oat's CSS variables with
    <code>light-dark()</code> for automatic dark mode:
  </p>
  <pre><code>--primary: light-dark(#2563eb, #60a5fa);
--accent: light-dark(#f0f4ff, #1e293b);
--success: light-dark(#16a34a, #4ade80);
--danger: light-dark(#dc2626, #f87171);
--warning: light-dark(#d97706, #fbbf24);</code></pre>
  <div class="hstack gap-2">
    <button>Primary</button>
    <button data-variant="secondary">Secondary</button>
    <button data-variant="danger">Danger</button>
    <button class="outline">Outline</button>
    <button class="ghost">Ghost</button>
  </div>
</section>

<!-- Svelte wrapper: Dialog -->
<section>
  <h2>Svelte Wrapper: Dialog</h2>
  <p>
    Oat's <code>&lt;dialog&gt;</code> uses <code>commandfor</code>/<code>command</code>.
    Our <code>&lt;Dialog&gt;</code> Svelte component wraps this with a snippet-based trigger API:
  </p>
  <pre><code>&lt;Dialog&gt;
  {'{'}#snippet trigger(show){'}'}
    &lt;button onclick={'{'}show{'}'}&gt;Open&lt;/button&gt;
  {'{/snippet}'}
  &lt;h2&gt;Modal content&lt;/h2&gt;
&lt;/Dialog&gt;</code></pre>
  <Dialog>
    <h2>Example Modal</h2>
    <p>Opened via the Svelte <code>&lt;Dialog&gt;</code> wrapper.</p>
  </Dialog>
</section>

<!-- Svelte wrapper: Alerts -->
<section>
  <h2>Svelte Wrapper: Alerts</h2>
  <p>
    The <code>alerts</code> store (<code>$lib/alerts</code>) is a standalone writable store.
    <code>&lt;Alerts /&gt;</code> renders them anywhere it's placed in the layout.
  </p>
  <Alerts />
  <div class="hstack gap-2">
    <button class="small" onclick={() => alerts.info("Informational message.")}>Info</button>
    <button class="small" data-variant="secondary" onclick={() => alerts.success("Saved!", 3000)}>Success</button>
    <button class="small" data-variant="warning" onclick={() => alerts.warning("Check this.")}>Warning</button>
    <button class="small" data-variant="danger" onclick={() => alerts.error("Failed.")}>Error</button>
  </div>
</section>

<!-- Svelte wrapper: Spinner + activityStore -->
<section>
  <h2>Svelte Wrapper: Spinner</h2>
  <p>
    <code>activityStore</code> (<code>$lib/activity</code>) wraps an async function and tracks its running state.
    Feed it to <code>&lt;Spinner&gt;</code> for loading indicators on buttons.
  </p>
  <pre><code>const store = activityStore(() =&gt; fetch('/api/generate', {'{'} method: 'post' {'}'});
&lt;button onclick={'{'}store.run{'}'} disabled={'{'}$store{'}'}&gt;
  &lt;Spinner active={'{'}$store{'}'} /&gt; Generate
&lt;/button&gt;</code></pre>
  <div class="hstack gap-2">
    <div aria-busy="true"></div>
    <div aria-busy="true" data-spinner="large"></div>
    <button aria-busy="true" disabled>Loading</button>
  </div>
</section>

<!-- How we use cards -->
<section>
  <h2>Cards in This Project</h2>
  <p>
    Oat cards use <code>&lt;article&gt;</code> with <code>&lt;header&gt;</code> and
    <code>&lt;footer&gt;</code>. We use the <code>.row</code>/<code>.col-*</code> grid for layouts.
  </p>
  <div class="row">
    <article class="card col-4">
      <header>
        <h3>Post Card</h3>
        <span class="badge" data-variant="success">Published</span>
      </header>
      <p>Content goes here. No custom classes needed.</p>
      <footer class="hstack gap-2">
        <button class="outline small">Edit</button>
        <button class="small">View</button>
      </footer>
    </article>
    <article class="card col-4">
      <header>
        <h3>Interactive Progress</h3>
      </header>
      <progress value={progressValue} max="100"></progress>
      <p class="text-light">{progressValue}% complete</p>
      <footer class="hstack gap-2">
        <button class="ghost small" onclick={() => progressValue = Math.max(0, progressValue - 10)}>-10</button>
        <button class="ghost small" onclick={() => progressValue = Math.min(100, progressValue + 10)}>+10</button>
      </footer>
    </article>
    <article class="card col-4">
      <header>
        <h3>Empty State</h3>
      </header>
      <p class="text-light text-center">Nothing here yet.</p>
      <footer class="hstack justify-center mt-4">
        <button onclick={() => alerts.info("Created!")}>New Item</button>
      </footer>
    </article>
  </div>
</section>

<!-- Forms pattern -->
<section>
  <h2>Forms Pattern</h2>
  <p>
    Oat uses <code>&lt;label data-field&gt;</code> for styled inputs.
    Input groups use <code>&lt;fieldset class="group"&gt;</code> or <code>role="group"</code>.
  </p>
  <div class="row">
    <div class="col-6">
      <form onsubmit={(e) => e.preventDefault()}>
        <label data-field>
          Name
          <input type="text" placeholder="Enter name" />
        </label>
        <label data-field>
          <input type="checkbox" role="switch" /> Notifications
        </label>
        <fieldset class="hstack gap-4">
          <legend>Priority</legend>
          <label><input type="radio" name="p" value="low" /> Low</label>
          <label><input type="radio" name="p" value="med" checked /> Medium</label>
          <label><input type="radio" name="p" value="high" /> High</label>
        </fieldset>
        <button type="submit">Save</button>
      </form>
    </div>
    <div class="col-6">
      <div role="group">
        <label>
          <input type="text" placeholder="" />
          <span>Search</span>
        </label>
        <button><i class="bi bi-search"></i></button>
      </div>
    </div>
  </div>
</section>

<!-- Tabs + Dropdown (WebComponents) -->
<section>
  <h2>WebComponents</h2>
  <p>
    Oat ships <code>&lt;ot-tabs&gt;</code> and <code>&lt;ot-dropdown&gt;</code> as zero-config web components.
  </p>
  <div class="row">
    <div class="col-6">
      <ot-tabs>
        <div role="tablist">
          <button role="tab">Tab 1</button>
          <button role="tab">Tab 2</button>
        </div>
        <div role="tabpanel"><p>First panel content.</p></div>
        <div role="tabpanel"><p>Second panel content.</p></div>
      </ot-tabs>
    </div>
    <div class="col-6">
      <ot-dropdown>
        <button popovertarget="ref-menu" class="outline">Actions <i class="bi bi-chevron-down"></i></button>
        <menu popover id="ref-menu">
          <button role="menuitem" onclick={() => alerts.info("Edit")}><i class="bi bi-pencil"></i> Edit</button>
          <button role="menuitem" onclick={() => alerts.info("Duplicate")}><i class="bi bi-copy"></i> Duplicate</button>
          <hr>
          <button role="menuitem" onclick={() => alerts.warning("Deleted")}><i class="bi bi-trash"></i> Delete</button>
        </menu>
      </ot-dropdown>
    </div>
  </div>
</section>

<!-- Utilities we use -->
<section>
  <h2>Layout Utilities</h2>
  <p>
    <code>.hstack</code>/<code>.vstack</code> for flex, <code>.gap-*</code> for spacing,
    <code>.row</code>/<code>.col-*</code> for grid. <code>.text-light</code> for muted text.
  </p>
  <div class="hstack gap-2 mb-4">
    <span class="badge">Default</span>
    <span class="badge" data-variant="success">Success</span>
    <span class="badge" data-variant="warning">Warning</span>
    <span class="badge" data-variant="danger">Danger</span>
    <span class="badge outline">Outline</span>
  </div>
  <div class="table">
    <table>
      <thead><tr><th>Class</th><th>Purpose</th></tr></thead>
      <tbody>
        <tr><td><code>.hstack</code></td><td>Horizontal flex with gap</td></tr>
        <tr><td><code>.vstack</code></td><td>Vertical flex with gap</td></tr>
        <tr><td><code>.gap-2</code></td><td>0.5rem gap</td></tr>
        <tr><td><code>.text-light</code></td><td>Muted text color</td></tr>
        <tr><td><code>.justify-center</code></td><td>Flex center justify</td></tr>
      </tbody>
    </table>
  </div>
</section>

<style>
  section {
    padding: var(--space-4);
    margin-block: var(--space-6);
    border-radius: var(--radius-medium);
    background: light-dark(var(--bg-1), var(--bg-1));
  }
  section h2 { margin-top: 0; }
  pre {
    padding: var(--space-3);
    border-radius: var(--radius-medium);
    background: light-dark(var(--bg-2), var(--bg-2));
    overflow-x: auto;
    font-size: 0.85em;
  }
  code { font-size: 0.9em; }
  .mb-4 { margin-block-end: var(--space-4); }
  .mt-4 { margin-block-start: var(--space-4); }
</style>
