import OpenAI from 'openai';
import { toFile } from 'openai/uploads';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

export async function POST(request: Request) {
  const { audioBase64, previousResponseId } = await request.json();
  console.log(audioBase64);
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(Buffer.from(audioBase64, 'base64'), 'audio.m4a'),
      model: 'whisper-1',
    });
    console.log('transcription: ', transcription.text);

    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: transcription.text,
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
              `Provide 3 advanced follow-up questions related to: ${transcription.text}. ` +
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
      responseId: response.id,
      responseMessage: response.output_text,
      transcribedMessage: transcription.text,
      ...(relatedQuestions && { relatedQuestions }),
    });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
