import { useCallback, useEffect, useRef, useState } from "react";
import { useSignalR } from "../contexts/signalr-context";
import { useHotkeys } from "react-hotkeys-hook";

export default function Collaboration() {
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");

  const { messages, connection } = useSignalR();

  const ref = useRef<HTMLDialogElement>(null);

  const handleSend = useCallback(() => {
    if (connection) {
      connection
        .invoke("SendMessage", user, message)
        .catch((err) => console.error(err));
      setMessage(""); // Clear the input after sending the message
    }
  }, [connection, message, setMessage, user]);

  const showDialog = useCallback(() => {
    ref.current?.showModal();
  }, []);

  useHotkeys("ctrl+k", showDialog);

  // useEffect(() => {
  //   const foo = (event: Event) => {
  //     event.preventDefault();
  //   };
  //   const dialog = ref.current;
  //   if (dialog) {
  //     dialog.addEventListener("cancel", foo);
  //   }
  //   return () => {
  //     if (dialog) {
  //       dialog.removeEventListener("cancel", foo);
  //     }
  //   };
  // });
  const allowDialogDismiss = false;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (!allowDialogDismiss) e.preventDefault();
    },
    [allowDialogDismiss]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleKeyDown2 = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const closeDialog = useCallback(() => {
    ref.current?.close();
  }, []);

  return (
    <>
      <div>
        <h1>Collaboration</h1>
        <button onClick={showDialog}>New chat message</button>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>

      <dialog ref={ref} onCancel={(event) => event.preventDefault()}>
        <input
          type="text"
          placeholder="User"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Message"
          value={message}
          onKeyDown={handleKeyDown2}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSend}>Send Message</button>
        <button onClick={closeDialog}>Close</button>
      </dialog>
    </>
  );
}
