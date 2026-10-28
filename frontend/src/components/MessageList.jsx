import { useEffect, useRef } from "react";

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="messages">
      {messages.length === 0 && <p className="muted empty">No messages yet. Say hello.</p>}
      {messages.map((m) =>
        m.notice ? (
          <p key={m._id} className="notice">{m.text}</p>
        ) : (
          <div key={m._id} className={m.user === currentUserId ? "msg mine" : "msg"}>
            <span className="meta">
              {m.user === currentUserId ? "You" : m.username} · {formatTime(m.createdAt)}
            </span>
            <p>{m.text}</p>
          </div>
        )
      )}
      <div ref={bottomRef} />
    </div>
  );
}
