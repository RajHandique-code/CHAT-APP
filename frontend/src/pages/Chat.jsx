import { useCallback, useEffect, useRef, useState } from "react";
import api, { errorMessage } from "../api.js";
import { createSocket } from "../socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import RoomList from "../components/RoomList.jsx";
import MessageList from "../components/MessageList.jsx";
import MessageInput from "../components/MessageInput.jsx";

export default function Chat() {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomError, setRoomError] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const activeRef = useRef(null);

  useEffect(() => {
    const socket = createSocket(localStorage.getItem("token"));
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      if (activeRef.current) socket.emit("joinRoom", activeRef.current._id);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (err) => {
      if (err.message === "Unauthorized") logout();
    });
    socket.on("newMessage", (msg) => {
      if (msg.room === activeRef.current?._id) setMessages((prev) => [...prev, msg]);
    });
    const notice = (verb) => ({ roomId, username }) => {
      if (roomId !== activeRef.current?._id) return;
      setMessages((prev) => [
        ...prev,
        { _id: `n-${Date.now()}-${Math.random()}`, notice: true, text: `${username} ${verb}` },
      ]);
    };
    socket.on("userJoined", notice("joined the room"));
    socket.on("userLeft", notice("left the room"));

    api
      .get("/rooms")
      .then((res) => setRooms(res.data))
      .catch((err) => {
        if (err.response?.status === 401) logout();
        else setRoomError(errorMessage(err));
      });

    return () => socket.disconnect();
  }, [logout]);

  const selectRoom = useCallback(async (room) => {
    const socket = socketRef.current;
    if (activeRef.current) socket.emit("leaveRoom", activeRef.current._id);
    activeRef.current = room;
    setActiveRoom(room);
    setMessages([]);
    try {
      const res = await api.get(`/rooms/${room._id}/messages`);
      if (activeRef.current?._id === room._id) setMessages(res.data);
    } catch {
      setRoomError("Could not load messages");
    }
    socket.emit("joinRoom", room._id);
  }, []);

  const createRoom = async (name) => {
    setRoomError("");
    try {
      const res = await api.post("/rooms", { name });
      setRooms((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      selectRoom(res.data);
      return true;
    } catch (err) {
      setRoomError(errorMessage(err));
      return false;
    }
  };

  const sendMessage = (text) => {
    if (!activeRoom) return;
    socketRef.current.emit("sendMessage", { roomId: activeRoom._id, text });
  };

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <header>
          <div>
            <strong>{user.username}</strong>
            <span className={connected ? "status online" : "status"}>{connected ? "Connected" : "Connecting"}</span>
          </div>
          <button className="link light" onClick={logout}>Sign out</button>
        </header>
        <RoomList
          rooms={rooms}
          activeId={activeRoom?._id}
          onSelect={selectRoom}
          onCreate={createRoom}
          error={roomError}
        />
      </aside>
      <main className="conversation">
        {activeRoom ? (
          <>
            <header className="room-title"># {activeRoom.name}</header>
            <MessageList messages={messages} currentUserId={user.id} />
            <MessageInput onSend={sendMessage} disabled={!connected} />
          </>
        ) : (
          <div className="placeholder">
            <h2>Choose a room</h2>
            <p className="muted">Select a room from the list, or create one to start a conversation.</p>
          </div>
        )}
      </main>
    </div>
  );
}
