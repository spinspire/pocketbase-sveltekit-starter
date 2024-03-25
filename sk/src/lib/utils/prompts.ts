/* export const promptFormat = `Title: Idea Exploration and Brain Mapping

Description: This prompt is designed to take a single phrase, idea, or concept input and deeply explore it across various dimensions. It aims to generate a rich, interconnected map of thoughts, questions, possibilities, and related topics to serve as a creative or analytical reference.

Input Instructions:
- Clearly state the phrase, idea, or concept you wish to explore.
- Provide any specific context or constraints you want the exploration to adhere to, such as a particular field of interest (e.g., technology, philosophy, art), purpose (e.g., innovation, problem-solving, education), or any specific questions you're looking to answer.

Output Specifications:
1. **Initial Overview**: A brief summary of the core idea or concept, including its basic definition or understanding in common parlance or within specific domains if applicable.
2. **Exploratory Questions**: A list of open-ended questions that stem from the initial idea, designed to provoke thought, uncover underlying assumptions, or explore potential implications and applications.
3. **Possibilities and Scenarios**: Detailed descriptions of possible scenarios, applications, or manifestations of the idea in various contexts. This section should aim to broaden the horizon of the initial concept, suggesting innovative or unconventional perspectives.
4. **Related Topics and Ideas**: Identification of closely and peripherally related topics, ideas, or concepts that could enrich or be enriched by the initial idea. This may include cross-disciplinary links, opposing viewpoints, or complementary concepts.
5. **Resources for Further Exploration**: A curated list of suggested readings, resources, or activities that could deepen understanding or expand the exploration of the idea. This could include books, articles, podcasts, or interactive tools.

Example Input:
"Explore the concept of 'Artificial Intelligence' with a focus on its implications for creative industries, considering ethical considerations and future innovation opportunities."

Example Output:
1. **Initial Overview**: Artificial Intelligence (AI) refers to the simulation of human intelligence in machines...
2. **Exploratory Questions**: What are the ethical implications of AI in art creation? Can AI truly replicate the creative process of humans?...
3. **Possibilities and Scenarios**: In the realm of music production, AI could revolutionize...
4. **Related Topics and Ideas**: Machine Learning, Creativity, Ethical AI, Human-AI Collaboration...
5. **Resources for Further Exploration**: "Life 3.0" by Max Tegmark, TED Talks on AI and creativity...

Usage Note: This prompt format can be adapted and expanded based on the complexity of the idea or concept being explored and the depth of exploration desired. Use eleborate markdown and emojis to make the output more engaging and visually appealing.`;

export const titlePrompt =
  "Given the content and key insights of a blog post, distill its essence and main arguments into a concise, compelling title that captures the reader's attention and accurately reflects the post's themes and conclusions. The title should be clear, engaging, and informative, providing a strong indication of the post's content and value. Do not output the body or tags, ONLY the title. The title should be a single sentence and should not exceed 35 characters. It should not end with a period. The title should be written in title case, with all words capitalized except for articles, prepositions, and conjunctions. Do not use any format other than the one specified";

export const tagPrompt =
  "Please summarize the provided blog article, focusing on its main points and themes. Following your summary, identify and list 3-5 relevant tags that capture the essence of the article. These tags should be short, lowercase, single words, and separated by commas. Ensure the tags strictly adhere to this format: 'example1, example2, example3'. Do not include spaces between the commas and words, and do not use any format other than the one specified. Do not output the summary ONLY the tags.";

export const blogSummaryPrompt =
  "Please review the provided blog article thoroughly. After your review, compose a few sentences summary that encapsulates the main points and themes of the article. It should be between 40-80 words exactlyThis summary should be concise and engaging, designed to accompany the article's title on a Tailwind CSS card as a brief overview. Ensure the summary captures the essence of the blog, highlighting its value or unique perspective to intrigue and inform potential readers.Use eleborate markdown and emojis to make the output more engaging and visually appealing. Do not output the body or tags, ONLY the summary. Do not use any format other than the one specified.";

export const imagePrompt =
  "Please review the provided text and generate a prompt for a slick minimal, modern image that captures the essence of the text.";

export const introPrompt = `You are a creative and unique idea generator. When given a phrase or thought, your task is to rephrase it into 5 distinct ideas, each from a different perspective:

  1. Optimistic: Always sees the glass as half full and believes in the best possible outcome.
  2. Pessimistic: Tends to see the downside in every situation and prepares for the worst.
  3. Realistic: Looks at the facts and figures to make practical and logical decisions.
  4. Creative: Thinks outside the box and approaches problems with a fresh perspective.
  5. Analytical: Breaks down problems into smaller parts to understand the underlying issues.
  
  Respond by providing five separate prompts based on how someone with each perspective would interpret the original idea. Generate alternative prompts that further explain the concept from each viewpoint.
  
  Format your response as follows:
  Optimistic: [Optimistic interpretation]
  Pessimistic: [Pessimistic interpretation]
  Realistic: [Realistic interpretation]
  Creative: [Creative interpretation]
  Analytical: [Analytical interpretation]
  
  Do not use hashtags or any other separators between the ideas. Simply start each line with the perspective name followed by a colon and the corresponding interpretation.
  
  Here is the original thought or phrase to interpret:`;
 */

  export const promptFormat = `Title: Comprehensive Idea Exploration and Mind Mapping

Description: This prompt is designed to take a single phrase, idea, or concept as input and explore it in-depth across various dimensions. The goal is to generate a comprehensive, interconnected map of thoughts, questions, possibilities, and related topics to serve as a rich creative or analytical reference.

Input Instructions:
- Clearly state the phrase, idea, or concept you wish to explore.
- Provide any specific context or constraints you want the exploration to adhere to, such as a particular field of interest (e.g., technology, philosophy, art), purpose (e.g., innovation, problem-solving, education), or any specific questions you're looking to answer.
- If applicable, mention any additional perspectives or dimensions you'd like the exploration to cover.

Output Specifications:
1. **Initial Overview**: A concise summary of the core idea or concept, including its basic definition, common understanding, and any relevant domain-specific interpretations.
2. **Exploratory Questions**: A comprehensive list of thought-provoking, open-ended questions that arise from the initial idea. These questions should uncover underlying assumptions, explore potential implications, and delve into practical applications.
3. **Possibilities and Scenarios**: Detailed descriptions of diverse scenarios, applications, or manifestations of the idea across various contexts. This section should expand the horizon of the initial concept, offering innovative, unconventional, and cross-disciplinary perspectives.
4. **Related Topics and Ideas**: Identification of a wide range of closely and peripherally related topics, ideas, or concepts that could enrich or be enriched by the initial idea. This may include interdisciplinary connections, contrasting viewpoints, or complementary concepts.
5. **Actionable Insights**: Derive practical insights, recommendations, or action points based on the exploration of the idea. These should be concrete, applicable suggestions that readers can implement or further investigate.
6. **Resources for Further Exploration**: A carefully curated list of recommended readings, resources, or activities to deepen understanding and expand the exploration of the idea. This could include books, articles, podcasts, videos, courses, or interactive tools.

Example Input:
"Explore the concept of 'Artificial Intelligence' with a focus on its implications for creative industries, considering ethical considerations, future innovation opportunities, and its potential impact on the workforce."

Example Output:
1. **Initial Overview**: Artificial Intelligence (AI) refers to the simulation of human intelligence in machines... 🤖
2. **Exploratory Questions**: 
   - What are the ethical implications of AI in creative processes? 🎨🔍
   - Can AI truly replicate the emotional depth and nuance of human creativity? 🧠❓
   - How might AI augment or enhance human creativity rather than replace it? 🤝💡
   ...
3. **Possibilities and Scenarios**: 
   - In the realm of music production, AI could revolutionize the composition process by... 🎵🎹
   - AI-powered tools could assist writers in generating unique story ideas, plots, and characters... 📝✨
   ...
4. **Related Topics and Ideas**:
   - Machine Learning 🧠📊
   - Computational Creativity 🎨💻
   - Ethical AI 🤖❤️
   - Human-AI Collaboration 👥🤝🤖
   ...
5. **Actionable Insights**:
   - Creative professionals should proactively learn about AI technologies to harness their potential... 📖💡
   - Organizations must develop ethical guidelines and frameworks for the use of AI in creative industries... 📜✅
   ...
6. **Resources for Further Exploration**:
   - Book: "The Creativity Code" by Marcus du Sautoy 📚
   - TED Talk: "How AI can enhance our memory, work and social lives" by Tom Gruber 🎥
   - Online Course: "Creative Applications of Deep Learning with TensorFlow" on Kadenze 🎓
   ...

Usage Note: This prompt format can be adapted and expanded based on the complexity of the idea or concept being explored and the depth of exploration desired. 
Feel free to customize the output specifications and example to suit your specific needs. Only export blog as if it were cut/paste into a magazine. 

Do not include any intro text about the output, just respond with the blog. Use rich markdown formatting and relevant emojis to make the output visually engaging and easy to navigate. 

This is the user's inspiration: `; 

export const titlePrompt = `Craft an SEO-Optimized Title for Your Blog Post: Detailed Instructions

Accurately Reflect Content: Your title should encapsulate the blog's primary themes, insights, and conclusions, integrating relevant keywords for SEO.
Clear and Engaging: Construct a title that is both informative and enticing, offering a glimpse into the post's value and compelling readers to click.
Length and Format: Aim for a concise title of 5-7 words, keeping within 50-60 characters to ensure full visibility in search engine results. This aligns with SEO best practices for HTML page titles, maximizing impact and search rankings.
Title Case and Punctuation: Apply title case capitalization, with all principal words capitalized except for articles, prepositions, and conjunctions. Avoid ending the title with punctuation to maintain clarity and focus.
Plain Text: Present the title in plain text format, suitable for inclusion in the HTML <title> tag, enhancing both SEO and user click-through rates.
Example Scenario:
"Delve into the advantages and challenges of remote work, including strategies for sustaining productivity, balancing work-life dynamics, and ensuring effective team collaboration in a digital workspace."

Optimized Title Example:
"Remote Work Success: 5 Essential Strategies"

When formulating your blog article's title, follow these guidelines closely to craft a single, SEO-optimized title. Ensure it meets the specified length and character count for optimal online visibility and engagement, without adding extra text or comments.

ONLY OUTPUT THE TITLE

This is the blog: 

`;

export const tagPrompt = `Please analyze the provided blog article and generate relevant tags based on its main points and themes. The tags should:

- Consist of 5 concise, lowercase, single-word tags, can be 2 or 3 words just joined together) that capture the essence of the article
- They shoud be separated by commas, without any spaces between the commas and words
- Cover key topics, concepts, or categories mentioned in the article
- Help readers quickly identify the article's main focus areas and improve searchability
- Only use alphabets, no special characters or numbers
- Be output as plain text, strictly adhering to the specified format: 'tag1,tag2,tag3,tag4,tag5'

Example Input:
"This article discusses the importance of mindfulness in reducing stress and improving overall well-being. It explores various mindfulness techniques, such as meditation, deep breathing, and yoga, and provides practical tips for incorporating these practices into daily life."

Example Output:
mindfulness,stress,well-being,meditation,breathing

Please generate tags for the given blog article, strictly following the specified format and requirements. Output only the tags, without any additional text or formatting. This is the blog article: `;

export const blogSummaryPrompt = `Please compose a concise and engaging summary for the provided blog article, designed to accompany the article's title on a Tailwind CSS card. The summary should:

- Encapsulate the main points, themes, and value proposition of the article in 50-100 words
- Be clear, informative, and captivating, encouraging readers to click through and read the full article
- Highlight the article's unique perspective, actionable insights, or key takeaways
- Use a mix of simple and compound sentences to create a flowing, easy-to-read narrative
- Incorporate relevant emojis and markdown formatting to make the summary visually appealing and engaging
- Be output as a single paragraph of plain text, without any additional content or formatting

Example Input:
"This article delves into the world of productivity hacks, offering practical tips and strategies to help readers maximize their time and efficiency. From prioritizing tasks using the Eisenhower Matrix to leveraging the power of time-blocking and pomodoro techniques, this post provides a comprehensive guide to boosting productivity in both personal and professional life."

Example Output:
🚀 Unlock the secrets to peak productivity with this ultimate guide! 🔓📈 Discover proven techniques like the Eisenhower Matrix, time-blocking, and pomodoro to maximize your time and efficiency. 📅⏰ Whether you're looking to crush your personal goals or excel in your professional life, this article offers practical, actionable insights to help you master the art of productivity. 💪📚 Get ready to take your performance to the next level! 🎯🌟

Please generate a summary for the given blog article, strictly adhering to the specified format and requirements. Output only the summary, without any additional text or formatting. This is the blog article: `;

export const imagePrompt = `Enhanced Image Prompt Generation Guidelines:

"Analyze the provided text to create a comprehensive prompt for designing an image that not only encapsulates the text's core message but also adheres to a specific aesthetic directive. The crafted image prompt should:

Concisely depict a scene or concept that aligns with the main ideas or themes presented in the text, ensuring the visual representation is both impactful and relevant.
Clearly define a minimalist, modern style, emphasizing a sleek design with a 2-3 color monotone palette to ensure visual consistency and cohesion across images.
Detail the composition, including any critical elements or symbols that should be featured, to reinforce the text's message through visual means.
Direct the mood, emotion, or atmosphere to reflect the text's tone, using minimalistic design principles to evoke the intended feelings in the audience.
Utilize natural language to offer clear, precise instructions tailored for an artist or designer, encapsulating the request in 3-5 descriptive sentences.
The description must be delivered as plain text, focused solely on the image prompt without additional content or formatting.

Make sure to NOT include faces or hands in the image - call this out specifically!

Example Input:
'This article explores the concept of minimalism as a lifestyle choice, discussing its benefits for mental clarity, financial freedom, and environmental sustainability. It offers practical tips for decluttering, simplifying one's life, and finding contentment with less.'

Example Output:
'Design a sleek, minimalistic image that reflects the essence of adopting a minimalist lifestyle for mental clarity and sustainable living. The scene should be set in a modern, sparsely decorated interior with vast negative space, featuring 2-3 colors such as white, soft gray, and a hint of green from a solitary plant. This space should embody tranquility, simplicity, and the elegance of minimalism, with just a few items of furniture that highlight functionality and aesthetic appeal. Aim to capture a mood of calmness and introspection, encouraging viewers to envisage a life of fewer possessions but greater purpose.'

This is the users text:`;


export const introPrompt = `You are an innovative thought generator, capable of interpreting a given phrase or idea from five distinct perspectives. When presented with a concept, your task is to rephrase it into five unique ideas, each embodying a different viewpoint:

1. 🌞 Optimistic: Consistently sees the bright side and envisions the most favorable outcomes.
2. 🌧️ Pessimistic: Tends to focus on the negative aspects and anticipates potential drawbacks.
3. 🧐 Realistic: Assesses situations objectively, basing decisions on facts and practicality.
4. 🎨 Creative: Approaches challenges with originality, thinking innovatively to generate novel ideas.
5. 🔍 Analytical: Methodically deconstructs issues to identify underlying causes and patterns.

For each perspective, generate a thought-provoking interpretation of the original concept, offering a deeper understanding of the idea through the lens of that particular mindset.

Please format your response as follows, using only plain text without any additional separators or formatting (seperate each interpretation with a new line):

Optimistic: [Optimistic interpretation]
Pessimistic: [Pessimistic interpretation] 
Realistic: [Realistic interpretation]
Creative: [Creative interpretation]
Analytical: [Analytical interpretation]

Example Input:
"The impact of social media on personal relationships and communication"

Example Output:
Optimistic: Social media has the power to strengthen connections, fostering deeper relationships and enabling people to stay in touch across vast distances.
Pessimistic: Social media is eroding the quality of personal interactions, leading to superficial relationships and a growing sense of isolation and disconnection.
Realistic: Social media is a tool that can facilitate or hinder personal relationships, depending on how it is used and the individual's ability to balance online and offline communication.
Creative: Social media is transforming the landscape of human interaction, giving rise to new forms of self-expression, collaboration, and community-building that transcend traditional boundaries.
Analytical: The impact of social media on personal relationships is complex and multifaceted, influenced by factors such as platform design, user behavior, and societal norms, requiring ongoing research and analysis to fully understand its implications.

ONLY RESPOND WITH THE FIVE INTERPRETATIONS, NO ADDITIONAL TEXT OR FORMATTING.

Please provide your five perspectives on the following concept:`;