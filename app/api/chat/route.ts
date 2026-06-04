export const maxDuration = 30;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error('HUGGINGFACE_API_KEY no configurado en .env.local');
    }

    // Construir el prompt
    const systemPrompt =
      'Sos el asistente IA de TambolA, una app de gestión para tambos caprinos (producción de leche de cabra). ' +
      'Ayudás al productor con manejo del rodeo, alimentación y raciones, ordeño, sanidad, reproducción y limpieza de instalaciones. ' +
      'Respondé siempre en español rioplatense, de forma clara, breve y práctica, con recomendaciones accionables. ' +
      'Si te falta información del establecimiento, hacé suposiciones razonables y aclaralas.';

    // Convertir mensajes al formato de Hugging Face
    const formattedMessages = [
      ...messages.map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...formattedMessages,
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Hugging Face API error:', error);
      throw new Error(
        error.error?.[0]?.message || 'Error en Hugging Face API'
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Error generando respuesta';

    // Retornar en formato compatible con el cliente
    const encoder = new TextEncoder();
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content,
            },
          },
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Error en chat' },
      { status: 500 }
    );
  }
}
