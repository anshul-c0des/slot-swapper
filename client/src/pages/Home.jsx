import { useState } from "react";
import Modal from "../components/Modal";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome to SlotSwapper</h1>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setOpen(true)}
      >
        Open Modal
      </button>

      <Modal open={open} setOpen={setOpen} title="Test Modal">
        <p>This is a test modal using Shadcn UI.</p>
      </Modal>
    </div>
  );
}
