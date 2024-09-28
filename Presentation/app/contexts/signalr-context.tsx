import React, { createContext, useContext, useEffect, useState } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

interface SignalRContextValue {
  connection: HubConnection | null;
  messages: string[];
  setMessages: React.Dispatch<React.SetStateAction<string[]>>;
}

// Create a context
const SignalRContext = createContext<SignalRContextValue | null>(null);

// Custom hook to use the SignalR context
export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) throw new Error("No context");

  return context;
};

// SignalR provider to wrap the app and provide connection and messages
export const SignalRProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  // useEffect(() => {
  //   // Set up the SignalR connection
  //   const newConnection = new HubConnectionBuilder()
  //     .withUrl("http://localhost:5267/collabHub")
  //     .configureLogging(LogLevel.Debug)
  //     .build();

  //   setConnection(newConnection);

  //   console.log(newConnection);

  //   // Start the connection
  //   if (newConnection.state === HubConnectionState.Disconnected) {
  //     newConnection
  //       .start()
  //       .then(() => console.log("SignalR connection started"))
  //       .catch((err) => console.error("Connection error:", err));
  //   }

  //   return () => {
  //     console.log("stopping connection");
  //     if (newConnection) {
  //       newConnection.stop();
  //     }
  //   };
  // }, []);

  useEffect(() => {
    // Create the SignalR connection
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5267/collabHub")
      .configureLogging(LogLevel.Debug)
      .build();

    setConnection(newConnection);

    return () => {
      if (newConnection) {
        newConnection.stop(); // Clean up the connection when unmounted
      }
    };
  }, []); // Run only on initial mount

  useEffect(() => {
    if (connection) {
      // Start the connection
      if (connection.state === HubConnectionState.Disconnected) {
        connection
          .start()
          .then(() => console.log("SignalR connection started"))
          .catch((err) => console.error("Connection error:", err));
      }

      // Handle messages
      const handleReceiveMessage = (user: string, message: string) => {
        setMessages((prevMessages) => [...prevMessages, `${user}: ${message}`]);
      };

      connection.on("ReceiveMessage", handleReceiveMessage);

      // Cleanup listener
      return () => {
        connection.off("ReceiveMessage", handleReceiveMessage);
      };
    }
  }, [connection]); // Only re-run when connection changes

  return (
    <SignalRContext.Provider value={{ connection, messages, setMessages }}>
      {children}
    </SignalRContext.Provider>
  );
};
