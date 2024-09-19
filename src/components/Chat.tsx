import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button,  Placeholder, View } from "@aws-amplify/ui-react";
import { amplifyClient } from "@/app/amplify-utils";

// Types
type Message = {
  role: string;
  content: { text: string }[];
};

type Conversation = Message[];


// Constants

const SYSTEM_PROMPT = `
  To create a personalized travel planning experience, greet users warmly and inquire about their travel preferences 
  such as destination, dates, budget, and interests. Based on their input, suggest tailored itineraries that include 
  popular attractions, local experiences, and hidden gems, along with accommodation options across various price 
  ranges and styles. Provide transportation recommendations, including flights and car rentals, along with estimated 
  costs and travel times. Recommend dining experiences that align with dietary needs, and share insights on local 
  customs, necessary travel documents, and packing essentials. Highlight the importance of travel insurance, offer 
  real-time updates on weather and events, and allow users to save and modify their itineraries. Additionally, 
  provide a budget tracking feature and the option to book flights and accommodations directly or through trusted 
  platforms, all while maintaining a warm and approachable tone to enhance the excitement of trip planning.
`;

export function Chat() {
  const [conversation, setConversation] = useState<Conversation>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setInputValue(e.target.value);
  };



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const message = setNewUserMessage();
      fetchChatResponse(message);
    }
  };

  const fetchChatResponse = async (message: Message) => {
    setInputValue("");
    setIsLoading(true);

    try {
      console.log("conversation", conversation);
      const { data, errors } = await amplifyClient.queries.chat({
        conversation: JSON.stringify([...conversation, message]),
        systemPrompt: SYSTEM_PROMPT,
      });

      if (!errors && data) {
        console.log("Chat response:", JSON.parse(data));
        setConversation((prevConversation) => [
          ...prevConversation,
          JSON.parse(data),
        ]);
      } else {
        throw new Error(errors?.[0].message || "An unknown error occurred.");
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching chat response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastMessage = conversation[conversation.length - 1];
    console.log("lastMessage", lastMessage);
    // if (conversation.length > 0 && lastMessage.role === "user") {
    //   fetchChatResponse();
    // }
    (
      messagesRef.current as HTMLDivElement | null
    )?.lastElementChild?.scrollIntoView();
  }, [conversation]);

  const setNewUserMessage = (): Message => {
    const newUserMessage: Message = {
      role: "user",
      content: [{ text: inputValue }],
    };
    console.log("set", newUserMessage);
    setConversation((prevConversation) => [
      ...prevConversation,
      newUserMessage,
    ]);
    // (
    //   messagesRef.current as HTMLDivElement | null
    // )?.lastElementChild?.scrollIntoView();
    setInputValue("");
    return newUserMessage;
  };

  return (
    <View className="chat-container">
      <View className="messages" ref={messagesRef}>
        {conversation.map((msg, index) => (
          <View key={index} className={`message ${msg.role}`}>
            {msg.content[0].text}
          </View>
        ))}
      </View>
      {isLoading && (
        <View className="loader-container">
          <p>Thinking...</p>

          <Placeholder size="large" />
        </View>
      )}
     
     <form onSubmit={handleSubmit} className="input-container">
 
     
        <input
          name="prompt"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="input"
          type="text"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        />
        <Button
          type="submit"
          className="send-button"
          isDisabled={isLoading}
          loadingText="Sending..."
        >
          Send
        </Button>
    
      
    </form>
   
      {error ? <View className="error-message">{error}</View> : null}
    </View>
  );
};

export default Chat;