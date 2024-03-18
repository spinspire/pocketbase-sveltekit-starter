<script lang="ts">
import { metadata } from "$lib/app/stores";
import { fade, fly } from "svelte/transition";
import Particles from "svelte-particles";
import { loadSlim } from "tsparticles-slim";

//$metadata.title =
//  "mind.ai - Transform Your Thoughts into a Flourishing Mind Garden";
$metadata.description =
  "Discover how mind.ai empowers you to nurture, organize, and grow your ideas into something beautiful through AI-powered journaling and the Mind Gardens methodology.";

let particlesConfig = {
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      enable: true,
      color: "#ffffff",
    },
    move: {
      enable: true,
    },
    number: {
      value: 20,
    },
    size: {
      value: 3,
    },
  },
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: "repulse",
      },
    },
  },
};

let onParticlesLoaded = (event: CustomEvent<{ particles?: any }>) => {
  const particlesContainer = event.detail.particles;
  // you can use particlesContainer to call all the Container class
  // (from the core library) methods like play, pause, refresh, start, stop
};

let particlesInit = async (engine: any) => {
  await loadSlim(engine);
};
</script>

<svelte:head>
  <title>{$metadata.title}</title>
  <meta name="description" content={$metadata.description} />
</svelte:head>

<!-- Particles Background -->
<Particles
  id="tsparticles"
  options={particlesConfig}
  on:particlesLoaded={onParticlesLoaded}
  particlesInit={particlesInit}
/>

<!-- Hero Section -->
<div
  class="hero min-h-screen"
  style="background-image: url(img/treeBrain.png);"
>
  <div class="hero-overlay bg-opacity-60">

    <!-- Particles Background -->
<Particles
id="tsparticles"
options={particlesConfig}
on:particlesLoaded={onParticlesLoaded}
particlesInit={particlesInit}
/>
  </div>
  <div class="hero-content text-neutral-content text-center">
    <div class="max-w-lg" transition:fly={{ y: -20, duration: 500 }}>
      <h1 class="mb-5 text-5xl font-bold">
        Transform Your Thoughts into a Flourishing Mind Garden with AI
      </h1>
      <p class="mb-5">
        Discover how mind.ai empowers you to nurture, organize, and grow your
        ideas into something beautiful.
      </p>
      <button class="btn btn-primary btn-lg"
        >Plant Your First Thought Today</button
      >
    </div>
  </div>
</div>

<!-- Introduction to Mind Gardens Methodology -->
<div class="bg-base-100 py-16">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center" transition:fade={{ duration: 500 }}>
      <h2 class="mb-4 text-4xl font-bold">Cultivate Your Mental Ecosystem</h2>
      <p class="text-xl">
        In the Mind Gardens methodology, each thought or idea is a seed that can
        grow into insights and creations. mind.ai facilitates this growth
        through AI-powered journaling, helping you nurture your mental
        ecosystem.
      </p>
    </div>
    <div class="flex justify-center">
      <img
        src="img/mindgarden.png"
        alt="Mind Garden Infographic"
        class="max-w-screen-md w-full object-cover rounded-xl shadow-xl"
        transition:fly={{ y: 20, duration: 500 }}
      />
    </div>
  </div>
</div>

<!-- Features and Benefits -->
<div class="bg-base-200 py-16" id="features">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div class="flex items-center justify-center">
        <img
          src="img/cave.png"
          alt="Thought Capture Demo"
          class="h-96 w-full object-cover"
        />
      </div>
      <div transition:fly={{ x: 20, duration: 500 }}>
        <h3 class="mb-4 text-3xl font-bold">Effortless Thought Capture</h3>
        <p class="mb-4">
          Quickly jot down your ideas and watch them grow visually in your mind
          garden. The intuitive interface makes it easy to capture and organize
          your thoughts.
        </p>
        <h3 class="mb-4 text-3xl font-bold">Personalized AI Assistance</h3>
        <p class="mb-4">
          Our AI learns from your unique thought patterns and suggests prompts
          to help your ideas flourish. It's like having a personal gardener for
          your mind.
        </p>
        <h3 class="mb-4 text-3xl font-bold">Private and Secure</h3>
        <p>
          Your mind garden is your private oasis. We use state-of-the-art
          encryption to ensure your thoughts remain confidential and secure.
        </p>
      </div>
    </div>
  </div>
</div>

<!-- How It Works -->
<div class="bg-base-100 py-16" id="how-it-works">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center" transition:fade={{ duration: 500 }}>
      <h2 class="mb-4 text-4xl font-bold">How mind.ai Works</h2>
      <p class="text-xl">
        Our AI-powered journaling process is simple and intuitive.
      </p>
    </div>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div class="card bg-base-200 shadow-xl">
        <figure class="px-10 pt-10">
          <img src="img/waterfall.png" alt="Capture Icon" class="rounded-xl" />
        </figure>
        <div class="card-body items-center text-center">
          <h3 class="card-title">1. Capture</h3>
          <p>Jot down your thoughts, ideas, and experiences in the app.</p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <figure class="px-10 pt-10">
          <img src="img/thoughts.png" alt="Nurture Icon" class="rounded-xl" />
        </figure>
        <div class="card-body items-center text-center">
          <h3 class="card-title">2. Nurture</h3>
          <p>
            Our AI provides personalized prompts and insights to help your ideas
            grow.
          </p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <figure class="px-10 pt-10">
          <img src="img/mountain.png" alt="Flourish Icon" class="rounded-xl" />
        </figure>
        <div class="card-body items-center text-center">
          <h3 class="card-title">3. Flourish</h3>
          <p>Watch your thoughts blossom into a beautiful mind garden.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Pricing -->
<div class="bg-base-200 py-16" id="pricing">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center" transition:fade={{ duration: 500 }}>
      <h2 class="mb-4 text-4xl font-bold">Simple, Transparent Pricing</h2>
      <p class="text-xl">Choose the plan that best fits your needs.</p>
    </div>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <!-- Pricing plans go here -->
    </div>
  </div>
</div>

<!-- Testimonials -->
<div class="bg-base-100 py-16" id="testimonials">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="mb-12 text-center text-4xl font-bold">What Our Users Say</h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
      <!-- Testimonials go here -->
    </div>
  </div>
</div>

<!-- Contact -->
<div class="bg-base-200 py-16" id="contact">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center" transition:fade={{ duration: 500 }}>
      <h2 class="mb-4 text-4xl font-bold">Get in Touch</h2>
      <p class="text-xl">
        Have a question or want to learn more? We'd love to hear from you!
      </p>
    </div>
    <div class="flex justify-center">
      <!-- Contact form goes here -->
    </div>
  </div>
</div>

<!-- Footer -->
<footer class="footer footer-center bg-base-100 text-base-content rounded p-10">
  <!-- Footer content goes here -->
</footer>
