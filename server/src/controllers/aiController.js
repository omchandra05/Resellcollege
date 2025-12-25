const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

let genAI;
if (config.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
} else {
  console.error("GEMINI_API_KEY is not configured. AI features will be disabled.");
}

exports.improveListing = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'AI service is not configured on the server.' });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are an expert copywriter for an online marketplace. Your task is to improve a product listing.
    - Make the title more catchy and descriptive.
    - Rewrite the description to be more appealing, persuasive, and easy to read. Use bullet points for features.
    - The response must be in JSON format with two keys: "improvedTitle" and "improvedDescription".
    
    Original Title: "${title}"
    Original Description: "${description}"
    
    JSON Response:`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response) {
      console.error('AI Improve Error: No response from Gemini. Possibly blocked for safety reasons.');
      if (result.promptFeedback) {
          console.error('Prompt Feedback:', result.promptFeedback);
      }
      return res.status(500).json({ message: 'AI could not process the request. It might have been blocked for safety reasons.' });
    }

    const text = response.text();
    
    // More robust JSON parsing
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found in AI response.");
      }
      const jsonString = text.substring(jsonStart, jsonEnd + 1);
      let aiResponse = JSON.parse(jsonString);

      // Clean up the description to remove markdown asterisks
      if (aiResponse.improvedDescription) {
        aiResponse.improvedDescription = aiResponse.improvedDescription
          .replace(/\*\*/g, '') // Removes bolding asterisks (e.g., **Key Features**)
          .replace(/^\s*\*\s?/gm, ''); // Removes list item asterisks at the start of lines
      }

      res.status(200).json(aiResponse);
    } catch (parseError) {
      console.error('AI JSON Parsing Error:', parseError.message, '| Original AI Response:', text);
      res.status(500).json({ message: 'AI returned an invalid format. Please try again.' });
    }
  } catch (error) {
    console.error('AI Improve Error:', error);
    const errorMessage = error.message || 'Failed to get AI suggestion.';
    res.status(500).json({ message: errorMessage });
  }
};

exports.handleChat = async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ message: 'AI service is not configured on the server.' });
    }

    const { history, prompt, system_instruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'A prompt is required.' });
    }

    // Define the default system instruction to make the chatbot specific to the website
    const DEFAULT_INSTRUCTION = "You are a friendly and helpful shopping assistant for 'Resell', an online marketplace designed for college students. Your primary role is to assist users with buying and selling items on this platform. Answer questions about how the site works, help users find specific items (like 'laptops' or 'textbooks'), and provide tips for safe transactions. Politely decline to answer any questions that are not related to the Resellcollege marketplace or buying/selling second-hand goods.";

    // Use a custom instruction from the frontend if provided, otherwise use the default
    const finalSystemInstruction = system_instruction || DEFAULT_INSTRUCTION;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: finalSystemInstruction
    });

    // Format history for Gemini, ensuring it doesn't start with a 'model' role.
    let chatHistory = history.map(msg => ({
      role: msg.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // If the first message is from the model (AI), remove it.
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: { maxOutputTokens: 2048 },
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;

    if (!response) {
      console.error('AI Chat Error: No response from Gemini. Possibly blocked for safety reasons.');
      if (result.promptFeedback) {
          console.error('Prompt Feedback:', result.promptFeedback);
      }
      return res.status(500).json({ message: 'AI could not process the chat. It might have been blocked for safety reasons.' });
    }

    let text = response.text();

    // Send the raw text, preserving newlines for multi-line responses
    res.status(200).json({ response: text });

  } catch (error) {
    console.error('AI Chat Error:', error);
    if (error.message && error.message.includes('SAFETY')) {
      return res.status(200).json({ response: "I'm sorry, I can't respond to that. Let's talk about something else." });
    }
    const errorMessage = error.message || 'Failed to get AI chat response.';
    res.status(500).json({ message: errorMessage });
  }
};