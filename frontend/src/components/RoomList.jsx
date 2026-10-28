import { useState } from "react";

export default function RoomList({ rooms, activeId, onSelect, onCreate, error }) {
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await onCreate(name.trim());
    if (ok) setName("");
  };

  return (
    <div className="rooms">
      <form className="new-room" onSubmit={submit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New room name" maxLength={40} />
        <button className="primary">Create</button>
      </form>
      {error && <p className="error small">{error}</p>}
      <ul>
        {rooms.length === 0 && <li className="muted empty">No rooms yet. Create the first one.</li>}
        {rooms.map((room) => (
          <li key={room._id}>
            <button className={room._id === activeId ? "room active" : "room"} onClick={() => onSelect(room)}>
              # {room.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
