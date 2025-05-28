import { GoogleGenerativeAI } from '@google/generative-ai';

interface ParsedTask {
  taskName: string;
  assignee: string;
  dueDate: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}

export async function parseTaskFromText(text: string): Promise<ParsedTask> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Parse the following task description and extract the task details in JSON format:
      "${text}"
      
      Extract:
      1. Task name (the main action/activity)
      2. Assignee (the person responsible)
      3. Due date and time (in ISO format)
      4. Priority (P1, P2, P3, or P4 - default to P3 if not specified)
      
      Return ONLY the JSON object without any markdown formatting or code blocks:
      {
        "taskName": "string",
        "assignee": "string",
        "dueDate": "string (ISO format)",
        "priority": "P1|P2|P3|P4"
      }
    `;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    const response = result.response;
    const responseText = response.text();

    const cleanedResponse = responseText
      .replace(/```json\s*|\s*```/g, '')
      .replace(/^\s+|\s+$/g, '');


    try {
      const parsedResponse = JSON.parse(cleanedResponse);

      if (!parsedResponse.taskName || !parsedResponse.assignee || !parsedResponse.dueDate) {
        throw new Error('Invalid response format from Gemini API');
      }

      return {
        taskName: parsedResponse.taskName,
        assignee: parsedResponse.assignee.toUpperCase(),
        dueDate: parsedResponse.dueDate,
        priority: parsedResponse.priority || 'P3',
      };
    } catch (parseError) {
      console.error('Error parsing Gemini API response:', parseError);
      throw new Error('Failed to parse Gemini API response');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to process task with Gemini API');
  }
}
