import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function POST(request: Request) {
  const { message, previousResponseId, imageBase64 } = await request.json();

  let messageContent = message;

  if (imageBase64) {
    messageContent = [
      { role: 'user', content: message },
      {
        role: 'user',
        content: [{ type: 'input_image', image_url: imageBase64 }],
      },
    ];
  }

  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: messageContent,
      ...(previousResponseId && { previous_response_id: previousResponseId }),
    });

    let relatedQuestions: string[] | undefined = undefined;
    try {
      const questionsCompletion = await openai.chat.completions.create({
        model: 'gpt-4.1',
        messages: [
          {
            role: 'user',
            content:
              `Provide 3 advanced follow-up questions related to: ${message}. ` +
              'Respond in JSON format as { "questions": ["q1","q2","q3"] }.',
          },
        ],
        response_format: { type: 'json_object' },
      });
      const parsed = JSON.parse(
        questionsCompletion.choices[0].message.content || '{}'
      );
      if (Array.isArray(parsed.questions)) {
        relatedQuestions = parsed.questions;
      }
    } catch (err) {
      console.error('Failed to generate related questions:', err);
    }

    return Response.json({
      responseMessage: response.output_text,
      responseId: response.id,
      ...(relatedQuestions && { relatedQuestions }),
    });
  } catch (error) {
    console.error('OpenAI error:', error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
