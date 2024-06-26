import * as z from "zod"
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { createBrowserClient } from "@supabase/ssr";
// export const maxDuration = 25; // This function can run for a maximum of 300 seconds
// export const dynamic = 'force-dynamic';

// Wrap the original stream to prepend an initial blank message
function withInitialMessage(originalStream: any) {
    let initialMessageSent = false;

    const wrappedStream = new ReadableStream({
        start(controller) {
            // Immediately queue an initial blank message
            const encoder = new TextEncoder();
            const blankMessageBytes = encoder.encode("***");
            controller.enqueue(blankMessageBytes);
            initialMessageSent = true;

            // Then, continue reading from the original stream
            const reader = originalStream.getReader();
            function push() {
                // @ts-ignore
                reader.read().then(({ done, value }) => {
                    if (done) {
                        controller.close();
                        return;
                    }
                    controller.enqueue(value);
                    push();
                // @ts-ignore
                }).catch(error => {
                    console.error('Error reading from original stream', error);
                    controller.error(error);
                });
            }
            push();
        }
    });

    return wrappedStream;
}

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

const schema = z.object({
        model: z.string(),
        max_tokens: z.number(),
        messages: z.array(z.object({
            role: z.string(),
            content: z.any()
        })),
        temperature: z.number(),
        top_p: z.number(),
        frequency_penalty: z.number(),
        presence_penalty: z.number()
});
    
export async function POST(
    req: Request,
) {
    try {
        // const supabaseAdmin = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE || '')

        // if (!supabaseAdmin) {
        //     throw new Error('Not authenticated')
        // }
// console.log("req", req)
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const openai = new OpenAIApi(configuration);

        const json = await req.json();

        const { model, max_tokens, messages, temperature, top_p, frequency_penalty, presence_penalty } = schema.parse(json);
        const chatMessages: ChatCompletionRequestMessage[] = messages.map((message: any) => {
            return {
                role: message.role as ChatCompletionRequestMessageRoleEnum,
                content: message.content
            }
        })

        const response = await openai.createChatCompletion({
            model,
            stream: true,
            max_tokens,
            messages: chatMessages,
            temperature, 
            top_p, 
            frequency_penalty, 
            presence_penalty,
        })
        // console.log("response", response.blob())

        const stream = OpenAIStream(response);
        // const streamWithInitialMessage = withInitialMessage(stream);
        // return stream response (SSE)
        console.log("stream", stream)
        return new StreamingTextResponse(stream);

    } catch (error) {
        console.log("Error in ai chat route:", error)
        if (error instanceof z.ZodError) {
            return new Response(JSON.stringify(error.issues), { status: 422 })
        }
        return new Response(null, { status: 500 })
    }
}


