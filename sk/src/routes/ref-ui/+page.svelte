<script>
  import { alerts } from "$lib/components/Alerts.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import RadioText from "$lib/components/RadioText.svelte";
  import Spinner from "$lib/components/Spinner.svelte";
  import ToggleText from "$lib/components/ToggleText.svelte";
  import { metadata } from "$lib/metadata";
  import { text } from "@sveltejs/kit";

  const COLORS = ["info", "success", "warning", "error"];

  $effect(() => {
    $metadata = {
      title: "Ref UI",
      description: "A reference UI for PocketBase",
      headline: "UI Reference",
    };
  });
</script>

<div class="example">
  <h2>Alerts</h2>
  <p>
    Alerts can be created by importing <code>alerts</code> from the
    <code>&lt;Alerts /&gt;</code> component. These alerts will be shown anywhere
    the component is declared.
  </p>
  <div role="group">
    {#each COLORS as type}
      <button
        class="bg-{type}"
        onclick={() => alerts.add({ message: `This is a ${type} alert`, type })}
      >
        {type} alert
      </button>
    {/each}
  </div>
</div>

<div class="example">
  <h2>Grouping inputs</h2>
  <p>
    Grouping inputs can be done using the <code>role="group"</code> attribute. This
    is useful for grouping related inputs together, such as in a form or a set of
    controls.
  </p>
  <div role="group">
    <label>
      <input type="date" placeholder="" />
      <span>Date</span>
    </label>
    <button onclick={() => alerts.info("Button clicked")}>Submit</button>
  </div>
  <div role="group">
    <label>
      <input type="text" placeholder="" />
      <span>Username</span>
    </label>
    <label>
      <input type="email" placeholder="" />
      <span>Email</span>
    </label>
  </div>
</div>

{#snippet buttonColorShowcase(c, content)}
  {#each COLORS as color}
    <button class="{c} bg-{color}">{content ?? "button"}</button>
  {/each}
  <br /><br />
  {#each COLORS as color}
    <a href="#" role="button" class="{c} bg-{color}">
      {content ?? "link button"}
    </a>
  {/each}
{/snippet}

<div class="example">
  <h2>Buttons</h2>
  <p>
    links can be styled as buttons using the <code>role="button"</code>:
  </p>
  <a href="#" role="button">This is a link</a>
  <button>This is a button</button>
  <p>
    You can add <code>.small .round</code> classes to make buttons small / round
    / circular:
  </p>
  <h3>Small Button</h3>
  <button class="small"> button </button>
  {@render buttonColorShowcase("small")}
  <h3>Round Button</h3>
  <button class="round"> button </button>
  {@render buttonColorShowcase("round")}
  <h3>Small Round Button</h3>
  <button class="small round"> x </button>
  {@render buttonColorShowcase("small round", "x")}
</div>

<div class="example">
  <h2>Action Buttons</h2>
  <p>Action buttons allow you to hide a dropdown menu inside a button:</p>
  <div role="menu">
    <button title="Sub Actions" aria-label="Sub Actions">
      Click for Actions
    </button>
    <menu>
      <button onclick={() => alerts.info("Action 1")}>Sub Action 1</button>
      <button onclick={() => alerts.info("Action 2")}>Sub Action 2</button>
      <button onclick={() => alerts.info("Action 3")}>
        Extra Long Sub Action 3
      </button>
      <a href="#" role="button">Link</a>
      <a href="#" role="button">Extra Long Link</a>
    </menu>
  </div>
  <p>
    In this example the action button is wrapped with another button using
    [role="group"]
  </p>
  <div role="group">
    <button>Main Action</button>
    <div role="menu">
      <button title="Sub Actions" aria-label="Sub Actions">
        <i class="bx bx-dots-vertical"></i>
      </button>
      <menu>
        <button onclick={() => alerts.info("Action 1")}>Sub Action 1</button>
        <button onclick={() => alerts.info("Action 2")}>Sub Action 2</button>
        <button onclick={() => alerts.info("Action 3")}>
          Extra Long Sub Action 3
        </button>
        <a href="#" role="button">Link</a>
        <a href="#" role="button">Extra Long Link</a>
      </menu>
    </div>
  </div>
</div>

<div class="example">
  <h2>Radios & Switches</h2>
  <p>
    For basic switches use <code>[role="switch"]</code>:
  </p>
  <label>
    <input type="checkbox" role="switch" />
    <span></span>
  </label>
  <p>
    For descriptive switches, use the <code>ToggleText</code> component:
  </p>
  <ToggleText optionDefault="Off" optionChecked="On" />
  <p>
    For radio buttons, use the <code>RadioText</code> component:
  </p>
  <RadioText choices={["foo", "bar", "baz"]} value="bar" />
</div>

<div class="example">
  <h2>Colors</h2>
  <p>
    You can set set the color / background color of an element using the
    <code>.&lt;COLOR&gt;</code> and <code>.bg-&lt;COLOR&gt;</code>
  </p>
  <ul>
    {#each COLORS as color}
      <li class={color}>This is a {color} text</li>
      <li class="bg-{color}">This is a {color} background</li>
    {/each}
  </ul>
</div>

<div class="example">
  <h2>Spinners</h2>
  <p>
    The <code>&lt;Spinner /&gt;</code> component is used to indicate loading or processing
    states.
  </p>
  <Spinner active />
</div>

<div class="example">
  <h2>Dialog</h2>
  <p>For a pop-out dialog use <code>&lt;Dialog /&gt;</code>:</p>
  <Dialog>
    <h2>Dialog Title</h2>
    <p>This is a dialog content area.</p>
    <p>You can put any content here, including forms, text, images, etc.</p>
  </Dialog>
</div>

<div class="example">
  <h2>Details</h2>
  <details>
    <summary>Details block</summary>
    <p>
      This is a details block. It can be used to hide or show content. Click the
      summary to toggle visibility.
    </p>
    <p>
      You can put any content inside, including other components, text, images,
      etc.
    </p>
    <p>
      For example, you can include a form, a table, or any other HTML elements.
    </p>
  </details>
</div>

<div class="example">
  <h2>Cards</h2>
  <div class="cards">
    <section>
      <header><h1>Header H1</h1></header>
      <div>
        <p>para 1</p>
        <p>para 2</p>
      </div>
      <footer>this is footer</footer>
    </section>
    <section>
      <header><h2>Header H2</h2></header>
      <div>
        <p>para 1</p>
        <p>para 2</p>
        <p>para 3</p>
      </div>
      <footer>this is footer</footer>
    </section>
    <section>
      <header><h3>Header H3</h3></header>
      <div>
        <p>para 1</p>
        <p>para 2</p>
      </div>
      <footer>this is footer</footer>
    </section>
    <section>
      <header>Header</header>
      <div>
        <p>para 1</p>
        <p>para 2</p>
      </div>
      <footer>this is footer</footer>
    </section>
  </div>
  <p>
    Cards with a direct child <code>&lt;table&gt;</code> will be styled as a table
    card:
  </p>
  <div class="cards">
    <section>
      <header>Table Card</header>
      <div>
        <table>
          <tbody>
            {#each COLORS as color}
              <tr>
                <th class={color}>{color}</th>
                <td
                  >This is a {color}
                  <span class="bg-{color}">background</span></td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<style lang="scss">
  div.example {
    h2 {
      margin-top: 0;
    }
    padding: 1rem;
    margin-block: 1.5rem;
    border-radius: var(--main-radius);
    background-color: var(--background);
  }
</style>
