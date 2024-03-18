<script lang="ts">
  import { metadata } from "$lib/app/stores";

  //$metadata.title = "mind. ai journaling";
  $metadata.description = "Modible is a modern, minimalist, and mobile-friendly journaling app that seamlessly integrates AI to enhance your writing experience. Capture your thoughts, explore ideas, and unleash your creativity with Modible.";
</script>

<svelte:head>
  <title>{$metadata.title}</title>
  <meta name="description" content={$metadata.description} />
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-lg">
      <h1 class="text-5xl font-bold mb-6">mind.ai</h1>
      <p class="py-6 text-lg">
        Modible is a modern, minimalist, and mobile-friendly journaling app that seamlessly integrates AI to enhance your writing experience. Capture your thoughts, explore ideas, and unleash your creativity with Modible.
      </p>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </div>
</div>

<div class="bg-base-100 py-16">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl font-bold mb-12 text-center">Features</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Minimalist Design</h3>
          <p>Our clean and intuitive interface allows you to focus on what matters most - your writing. Enjoy a clutter-free and distraction-free environment that promotes clarity and concentration.</p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">AI-Powered Writing Assistant</h3>
          <p>Experience the power of artificial intelligence seamlessly integrated into your writing process. Our AI-powered writing assistant provides smart suggestions, helps you overcome writer's block, and offers creative prompts to keep your ideas flowing.</p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Cross-Platform Sync</h3>
          <p>Access your journal from anywhere, anytime. Modible automatically synchronizes your entries across all your devices, ensuring your thoughts are always with you, whether you're on your phone, tablet, or computer.</p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Customizable Themes</h3>
          <p>Personalize your journaling experience with our customizable themes. Choose from a variety of carefully crafted color schemes that suit your mood and style, creating an environment that inspires you to write.</p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Privacy and Security</h3>
          <p>Your privacy is our priority. Modible employs state-of-the-art encryption to ensure your journal entries remain secure and confidential. Write freely, knowing that your thoughts are protected.</p>
        </div>
      </div>
      <div class="card bg-base-200 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Insights and Reflection</h3>
          <p>Gain valuable insights into your writing habits and personal growth. Modible provides intelligent analysis and reflection prompts to help you understand your thought patterns, track your progress, and cultivate self-awareness.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="bg-base-200 py-16">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-4xl font-bold mb-12 text-center">Testimonials</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="italic">"Modible has revolutionized my journaling practice. The AI-powered suggestions and prompts have helped me dig deeper into my thoughts and unleash my creativity. It's a game-changer!"</p>
          <div class="card-actions justify-end">
            <h4 class="text-lg font-bold">John Doe</h4>
            <p>Writer and Creative Enthusiast</p>
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <p class="italic">"The minimalist design and seamless cross-platform sync make Modible my go-to journaling app. It's simple, intuitive, and helps me stay focused on what matters - my writing."</p>
          <div class="card-actions justify-end">
            <h4 class="text-lg font-bold">Jane Smith</h4>
            <p>Productivity Coach</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="bg-base-100 py-16">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold mb-6">Ready to Start Journaling?</h2>
    <p class="text-lg mb-8">Try Modible today and experience the power of minimalist, AI-powered journaling.</p>
    <button class="btn btn-primary btn-lg">Get Started</button>
  </div>
</div>