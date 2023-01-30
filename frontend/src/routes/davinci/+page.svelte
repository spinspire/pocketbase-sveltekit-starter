<script lang="ts">
  const endpoint = window.location.host + "/api/davinci?input=somequestion";
  const text = `
This is the main language-model behind chatGPT. 
To access it via API, make a GET request to <h3><code>${endpoint}</code></h3> 

<b>Here's how Davinci describes itself:<br></b>
GPT-3 (Generative Pretrained Transformer 3) Davinci is a state-of-the-art language AI model developed by OpenAI. It is trained on a massive corpus of text data to generate text that is similar to human language. With over 175 billion parameters, GPT-3 is one of the largest language models to date, and its capabilities extend far beyond simple text generation.<br><br>

Davinci has been trained to perform a variety of natural language processing tasks, such as text translation, summarization, question answering, and more. It can also generate text in a variety of styles and genres, making it a versatile tool for a wide range of applications, including chatbots, language-based virtual assistants, and even creative writing.<br><br>

Due to its human-like text generation and advanced language processing capabilities, GPT-3 Davinci has garnered a great deal of attention in the AI community, and has been the subject of much research and experimentation.`;
</script>

<h1>GPT3 Davinci</h1>
<p>{@html text}</p>
