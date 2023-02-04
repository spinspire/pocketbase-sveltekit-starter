<script lang="ts">
  import { metadata } from "$lib/app/stores";
  import { currentUser } from "$lib/pocketbase";
  $metadata.title = "Pollamin - AI Simplified";
</script>

<samp> Your API key: {$currentUser?.apikey} </samp>

<ul>
  <li><a href="/hello">Hello - read this first!</a></li>
  <li><a href="/davinci">GPT3 - DaVinci</a></li>
</ul>
<body>
  <main>
    <h2>About Pollamin</h2>
    <p>Excited about the future of AI? So are we! At Pollamin, our goal 
      is to make AI accessible to everyone. We provide a user-friendly 
      interface to the OpenAI API, so that even those without technical 
      expertise can harness the power of artificial intelligence in their own projects.</p>

    <h2>Why Should You Care?</h2>
    <p>With its cutting-edge research and focus on responsible AI, OpenAI is shaping the future
       of how we use and interact with artificial intelligence. You should care about OpenAI because 
       it is shaping the future of artificial intelligence and the impact it will have on society. 
       OpenAI's research and development in AI technology has the potential to revolutionize various 
       industries and fields, leading to significant advancements and improvements. Additionally, as AI 
       becomes increasingly integrated into our daily lives, the ethical and responsible use of AI 
       technology is of utmost importance. </p>
    
    <h2>Our Features</h2>
    <ul>
      <li>Easy-to-use API</li>
      <li>User-friendly dashboard</li>
      <li>Integration with popular programming languages and platforms</li>
      <li>Support for multiple AI models</li>
    </ul>
    
    <h2>Get Started</h2>
    <p>Sign up by logging in with your Google credentials and start incorporating AI into your projects with ease. 
      Whether you're a business owner, developer, or just someone with an interest in AI, our API has everything you need to get started.</p>
    <!-- <a href="#Login">Sign up now</a> -->
  </main>

  <footer>
    <p>&copy; Pollamin | AI Simplified 2023</p>
  </footer>
</body>