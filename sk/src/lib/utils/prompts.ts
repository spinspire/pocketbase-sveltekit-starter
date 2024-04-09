/* 
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

Please provide your five perspectives on the following concept:`; */

export const promptFormat = `You will accept an input ranging from a single word to a complete article and explore it in-depth across various dimensions. The goal is to generate a comprehensive, interconnected map of thoughts, questions, possibilities, and related topics organized into bullet points. These bullet points will serve as "seed" information that the user can later select from to generate more detailed articles.

Input Instructions:
- Provide the word, phrase, idea, concept, or article you wish to explore.
- Specify any specific context or constraints you want the exploration to adhere to, such as a particular field of interest (e.g., technology, philosophy, art), purpose (e.g., innovation, problem-solving, education), or any specific questions you're looking to answer.
- If applicable, mention any additional perspectives or dimensions you'd like the exploration to cover.

Output Specifications:
1. **Initial Overview**: A concise summary of the core idea or concept, including its basic definition, common understanding, and any relevant domain-specific interpretations.
2. **Exploratory Questions**: A list of thought-provoking, open-ended questions that arise from the initial idea. These questions should uncover underlying assumptions, explore potential implications, and delve into practical applications.
3. **Possibilities and Scenarios**: Descriptions of diverse scenarios, applications, or manifestations of the idea across various contexts. This section should expand the horizon of the initial concept, offering innovative, unconventional, and cross-disciplinary perspectives.
4. **Related Topics and Ideas**: Identification of a wide range of closely and peripherally related topics, ideas, or concepts that could enrich or be enriched by the initial idea. This may include interdisciplinary connections, contrasting viewpoints, or complementary concepts.
5. **Actionable Insights**: Derive practical insights, recommendations, or action points based on the exploration of the idea. These should be concrete, applicable suggestions that readers can implement or further investigate.
6. **Resources for Further Exploration**: A curated list of recommended readings, resources, or activities to deepen understanding and expand the exploration of the idea. This could include books, articles, podcasts, videos, courses, or interactive tools.

Please organize the output into relevant bullet points under each of the specified sections. These bullet points will be used as "seed" information for generating more detailed articles later.

Do not include any intro text about the output, just respond with the mind map organized into bullet points. Use markdown formatting to make the output easy to navigate. 

This is the user's input: `;

export const tagTreePrompt = `
Task: Generate a hierarchical tag structure from a given list of tags

Input:
- A list of tags as strings in an array

Output:
[
  {
    "name": "Node 1",
    "children": [
      {
        "name": "Child 1",
        "children": [
          {
            "name": "Grandchild 1"
          },
          {
            "name": "Grandchild 2"
          }
        ]
      },
      {
        "name": "Child 2"
      }
    ]
  },
  {
    "name": "Node 2",
    "children": [
      {
        "name": "Child 3"
      },
      {
        "name": "Child 4"
      }
    ]
  }
]

Rules:
1. The hierarchical tag structure should have a maximum depth of 5 levels.
2. Each node in the hierarchy should have at most 5 children.
3. The top 3-5 levels of the hierarchy can be AI-generated headings to categorize the tags.
4. The given tags should be used to complete the lower levels of the hierarchy.
5. Related tags should be grouped together under appropriate parent nodes.
6. The hierarchy should be designed to allow users to easily navigate and discover blogs based on the tags.
7. Broader terms should be placed higher in the hierarchy, while more specific terms should be placed lower.
8. If there are any tags that don't fit into the generated categories, they should be placed under an "Others" or "Uncategorized" node.
9. The output should be a valid JSON object in the specified format.

Steps:
1. Analyze the given list of tags and identify common themes or categories.
2. Generate 3-5 levels of AI-generated headings to categorize the tags based on their themes or categories.
3. Assign the tags to appropriate parent nodes in the hierarchy, ensuring that no node has more than 5 children.
4. Place broader terms higher in the hierarchy and more specific terms lower.
5. Group related tags together under the same parent node.
6. If there are any tags that don't fit into the generated categories, create an "Others" or "Uncategorized" node and place them there.
7. Review the generated hierarchy to ensure it allows for easy navigation and discovery of blogs based on the tags.
8. Output the hierarchical tag structure as a valid JSON object in the specified format.

Example input:
[
  "ai",
  "machine-learning",
  "deep-learning",
  "natural-language-processing",
  "robotics",
  "computer-vision",
  "blockchain",
  "cryptocurrency",
  "web3",
  "smart-contracts",
  "decentralized-finance",
  "health",
  "fitness",
  "nutrition",
  "mental-health",
  "productivity",
  "time-management",
  "goal-setting",
  "motivation",
  "leadership"
]

Please generate the hierarchical tag structure for the given list of tags, following the specified format and rules. 

DO NOT INCLUDE ANY INTRODUCTORY TEXT, JUST RESPOND WITH THE JSON OBJECT.

This is the list of tags: `;

export const blogResponsePrompt = `
###Instruction###
Given a list of key topics, questions, and ideas provided below, generate a detailed and comprehensive blog post. The blog post should:
1. Introduce the main theme based on the provided list.
2. Address each point in the list by providing in-depth analysis, context, or explanation as relevant.
3. Expand on the provided points with additional information, insights, or examples to create a full narrative.
4. Ensure the blog is structured logically, with a clear introduction, body (covering all provided points), and conclusion.
5. Write in an engaging and informative tone, suitable for readers who may be new to the subject or looking to deepen their understanding.

###Input Text###
- [User-provided list of phrases, questions, and ideas seperated by '/n']

Please parse the input text to identify the key topics and structure the blog post accordingly.
This is the input text:  
`;

export const titlePrompt = `Your job is to craft an SEO-Optimized title for the provided blog post. The title should be concise, engaging, and accurately reflect the content of the blog. Follow the guidelines below to create an effective title:

Accurately Reflect Content: Your title should encapsulate the blog's primary themes, insights, and conclusions, integrating relevant keywords for SEO.
Clear and Engaging: Construct a title that is both informative and enticing, offering a glimpse into the post's value and compelling readers to click.
Length and Format: Aim for a concise title of 5-7 words, keeping within 50-60 characters to ensure full visibility in search engine results. This aligns with SEO best practices for HTML page titles, maximizing impact and search rankings.
Title Case and Punctuation: Apply title case capitalization, with all principal words capitalized except for articles, prepositions, and conjunctions. Avoid ending the title with punctuation to maintain clarity and focus.
Plain Text: Present the title in plain text format, suitable for inclusion in the HTML <title> tag, enhancing both SEO and user click-through rates.

When formulating your blog article's title, follow these guidelines closely to craft a single, SEO-optimized title. Ensure it meets the specified length and character count for optimal online visibility and engagement, without adding extra text or comments.

No apostrophes, No parentheses, or special characters in the title.
Must be 50 - 60 total characters long.
ONLY OUTPUT THE TITLE

This is the blog: 

`;

export const tagPrompt = `Please analyze the provided blog article and generate relevant tags based on its main points and themes. The tags should:

- Generate of 3 concise, lowercase tags (can be 2 words joined together) that capture the essence of the article
- They should be separated by commas, without any spaces between the commas and words
- Cover key topics, concepts, or categories mentioned in the article
- Help readers quickly identify the article's main focus areas and improve searchability
- Only use alphabets, no special characters or numbers
- Output as plain text, strictly adhering to the specified format: 'tag1,tag2,tag3'

Example Input:
"This article discusses the importance of mindfulness in reducing stress and improving overall well-being. It explores various mindfulness techniques, such as meditation, deep breathing, and yoga, and provides practical tips for incorporating these practices into daily life."

Example Output:
mindfulness,stress,wellbeing

Please generate tags for the given blog article, strictly following the specified format and requirements. Output only the tags, without any additional text or formatting. This is the blog article: `;

export const blogSummaryPrompt = `Please compose a concise and engaging summary for the provided blog article, designed to accompany the article's title on a Tailwind CSS card. The summary should:

- Encapsulate the main points, themes, and value proposition of the article in 50 words or less
- Be clear, informative, and captivating, encouraging readers to click through and read the full article
- Highlight the article's unique perspective, actionable insights, or key takeaways
- Use a mix of simple and compound sentences to create a flowing, easy-to-read narrative
- Incorporate relevant emojis and markdown formatting to make the summary visually appealing and engaging
- Be output as a single paragraph of plain text, without any additional content or formatting

Example Input:
"This article delves into the world of productivity hacks, offering practical tips and strategies to help readers maximize their time and efficiency. From prioritizing tasks using the Eisenhower Matrix to leveraging the power of time-blocking and pomodoro techniques, this post provides a comprehensive guide to boosting productivity in both personal and professional life."

Example Output:
🚀 Unlock the secrets to peak productivity with this ultimate guide! 🔓📈 Discover proven techniques like the Eisenhower Matrix, time-blocking, and pomodoro to maximize your time and efficiency. 💪📚 Get ready to take your performance to the next level! 🎯🌟

Please generate a summary for the given blog article, strictly adhering to the specified format and requirements. Output only the summary, without any additional text or formatting. This is the blog article: `;

export const imagePrompt = `Enhanced Image Prompt Generation Guidelines:

"Analyze the provided text to create a comprehensive prompt for designing an image that not only encapsulates the text's core message but also adheres to a specific aesthetic directive. The crafted image prompt should:

Concisely depict a scene or concept that aligns with the main ideas or themes presented in the text, ensuring the visual representation is both impactful and relevant.
Clearly define a minimalist, modern style, emphasizing a sleek design with a 2-3 color monotone palette to ensure visual consistency and cohesion across images.
Detail the composition, including any critical elements or symbols that should be featured, to reinforce the text's message through visual means.
Direct the mood, emotion, or atmosphere to reflect the text's tone, using minimalistic design principles to evoke the intended feelings in the audience.
Utilize natural language to offer clear, precise instructions tailored for an artist or designer, encapsulating the request in 3-5 descriptive sentences.
Explicitly state that the image should not include any faces or hands.
The description must be delivered as plain text, focused solely on the image prompt without additional content or formatting.

This is the user's text:`;

export const introPrompt = `You are an innovative thought generator, capable of interpreting a given phrase or idea from six distinct perspectives. When presented with a concept, your task is to rephrase it into six unique ideas, each embodying a different viewpoint:

1. 🌞 Optimistic: Consistently sees the bright side and envisions the most favorable outcomes.
2. 🌧️ Pessimistic: Tends to focus on the negative aspects and anticipates potential drawbacks.
3. 🧐 Realistic: Assesses situations objectively, basing decisions on facts and practicality.
4. 🎨 Creative: Approaches challenges with originality, thinking innovatively to generate novel ideas.
5. 🔍 Analytical: Methodically deconstructs issues to identify underlying causes and patterns.
6. 😈 Devil's Advocate: Considers the other viewpoints and looks for alternate combinations or perspectives that challenge the prevailing ideas.

For each perspective, generate a thought-provoking interpretation of the original concept, offering a deeper understanding of the idea through the lens of that particular mindset.

Please format your response as follows, using only plain text without any additional separators or formatting (separate each interpretation with a new line):

Optimistic: [Optimistic interpretation]
Pessimistic: [Pessimistic interpretation] 
Realistic: [Realistic interpretation]
Creative: [Creative interpretation]
Analytical: [Analytical interpretation]
Devil's Advocate: [Devil's Advocate interpretation]

Example Input:
"The impact of social media on personal relationships and communication"

Example Output:
Optimistic: Social media has the power to strengthen connections, fostering deeper relationships and enabling people to stay in touch across vast distances.
Pessimistic: Social media is eroding the quality of personal interactions, leading to superficial relationships and a growing sense of isolation and disconnection.
Realistic: Social media is a tool that can facilitate or hinder personal relationships, depending on how it is used and the individual's ability to balance online and offline communication.
Creative: Social media is transforming the landscape of human interaction, giving rise to new forms of self-expression, collaboration, and community-building that transcend traditional boundaries.
Analytical: The impact of social media on personal relationships is complex and multifaceted, influenced by factors such as platform design, user behavior, and societal norms, requiring ongoing research and analysis to fully understand its implications.
Devil's Advocate: While social media can connect people, it may also create echo chambers that reinforce existing beliefs and limit exposure to diverse perspectives, potentially leading to increased polarization and conflict in personal relationships.

ONLY RESPOND WITH THE SIX INTERPRETATIONS, NO ADDITIONAL TEXT OR FORMATTING.

Please provide your six perspectives on the following concept:`;
