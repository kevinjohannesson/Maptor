import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";

const connection = new HubConnectionBuilder()
  .withUrl("http://localhost:5267/collabHub") // URL must match your SignalR hub endpoint
  .configureLogging(LogLevel.Debug)
  .build();

export function startConnection() {
  if (connection.state === HubConnectionState.Disconnected) {
    connection
      .start()
      .then(() => console.log("SignalR connection started"))
      .catch((err) => console.error("Connection error:", err));
  } else {
    console.log("SignalR connection is already active or in progress");
  }

  return connection;
}

export function onMessage(callback: (user: string, message: string) => void) {
  connection.on("ReceiveMessage", (user, message) => {
    callback(user, message);
  });
}

export function offMessage(callback: (user: string, message: string) => void) {
  connection.off("ReceiveMessage", callback);
}

export function sendMessage(user: string, message: string) {
  connection
    .invoke("SendMessage", user, message)
    .catch((err) => console.error(err));
}
