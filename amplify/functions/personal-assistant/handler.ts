
import {
    BedrockRuntimeClient,
    ConverseCommandInput,
    ConverseCommand,
  } from "@aws-sdk/client-bedrock-runtime";
  import type { Handler } from 'aws-lambda';
  
  // Constants
  const AWS_REGION = process.env.AWS_REGION;
  const MODEL_ID = process.env.MODEL_ID;
  
  // Configuration
  const INFERENCE_CONFIG = {
    maxTokens: 1000,
    temperature: 0.5,
  };
  
  // Initialize Bedrock Runtime Client
  const client = new BedrockRuntimeClient({ region: AWS_REGION });
  
  export const handler: Handler = async (
      event
    ) => {
  
      const { conversation, systemPrompt } = event.arguments;
    
      const input = {
          modelId: MODEL_ID,
          system: [{ text: systemPrompt }],
          messages: conversation,
          inferenceConfig: INFERENCE_CONFIG,
      } as ConverseCommandInput;
    
      try {
          const command = new ConverseCommand(input);
          const response = await client.send(command);
      
          if (!response.output?.message) {
            throw new Error("No message in the response output");
          }
  
  
      
      
        return JSON.stringify(response.output.message);
        } catch (error) {
          console.error("Error in chat handler:", error);
          throw error; // Re-throw to be handled by AWS Lambda
        }
    };
    