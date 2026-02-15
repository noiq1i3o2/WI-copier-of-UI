import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  ai = new GoogleGenAI({ apiKey });
};

const getAI = () => {
  if (!ai) {
    throw new Error("Gemini API not initialized. Please provide an API key.");
  }
  return ai;
};

// We use this to generate the HTML for the entire app UI from an image
export const generateLayoutFromImage = async (imageBase64: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64.split(',')[1]
            }
          },
          {
            text: `You are a Frontend Engineer. Analyze this UI screenshot. 
            Generate the HTML and Tailwind CSS code to replicate this interface EXACTLY. 
            
            Rules:
            1. Return ONLY raw HTML. Do not wrap in markdown \`\`\`. 
            2. Do not include <html>, <head>, or <body> tags. Start with the main container <div>.
            3. Use Tailwind CSS for all styling.
            4. For icons, use raw SVG strings directly inline. Do not use external libraries or icon fonts.
            5. Make it responsive and high fidelity.
            6. Ensure the background colors and text colors match the image.
            7. The output will be injected into a React component's <div>.
            `
          }
        ]
      }
    });

    let code = response.text || "";
    // Cleanup markdown if present
    code = code.replace(/```html/g, '').replace(/```/g, '');
    return code;
  } catch (error) {
    console.error("Layout Gen Error:", error);
    return "<div class='p-10 text-center text-red-500'>Failed to generate layout from image. Ensure your API Key is valid and supports the model.</div>";
  }
};

// Refine existing HTML based on user instruction
export const refineHtml = async (currentHtml: string, instruction: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helper that modifies HTML code based on user requests.
      
      Current HTML:
      ${currentHtml}

      User Instruction: "${instruction}"

      Rules:
      1. Modify the HTML to satisfy the instruction.
      2. Keep the rest of the structure intact.
      3. Return ONLY raw HTML. No markdown.
      4. Use Tailwind CSS for styling changes.
      `
    });
    
    let code = response.text || "";
    code = code.replace(/```html/g, '').replace(/```/g, '');
    return code;
  } catch (error) {
    console.error("Refinement Error:", error);
    return currentHtml; // Return original if failure
  }
}

// We use this to generate popups, alerts, and small widgets
export const generateWidgetHTML = async (prompt: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a UI Generator. The user wants to add a fake UI element to their screen.
      Request: "${prompt}"

      Rules:
      1. Generate a generic HTML element (like a modal, toast, banner, or floating button) using Tailwind CSS.
      2. It should look professional and polished.
      3. Use inline SVGs for icons.
      4. Return ONLY the raw HTML string. Do not wrap in markdown.
      5. Ensure it has a high z-index (z-50) and fixed positioning so it appears over the app.
      6. If it's a modal, center it. If it's a toast, place it top-right or top-center.
      
      Example prompt: "fake server error"
      Example output: <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div class="bg-white p-6 rounded-lg shadow-xl"><h3 class="text-red-600 font-bold">Server Error</h3>...</div></div>
      `
    });

    let code = response.text || "";
    code = code.replace(/```html/g, '').replace(/```/g, '');
    return code;
  } catch (error) {
    console.error("Widget Gen Error:", error);
    return `<div class="fixed top-4 right-4 z-50 bg-red-100 text-red-800 p-4 rounded shadow">Failed to generate widget: ${error}</div>`;
  }
};

export const getSimulatedResponse = async (userMessage: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Fake latency
    const responses = [
        "I'm just a simulated interface.",
        "That's interesting!",
        "Functionality not available in simulator mode.",
        "Please check the settings to clone a UI.",
        "System operating normally.",
        "Processing request..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
};
