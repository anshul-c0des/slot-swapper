import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket";

export default function Requests() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [tab, setTab] = useState("incoming");

  const fetchRequests = async () => {
    const incRes = await axiosClient.get("/swap-requests/incoming");
    const outRes = await axiosClient.get("/swap-requests/outgoing");
    setIncoming(incRes.data);
    setOutgoing(outRes.data);
  };

  useEffect(() => {
    fetchRequests();

    socket.on("swapResponseUpdate", (data) => {
      fetchRequests();
      alert(`Swap ${data.status.toLowerCase()}!`);
    });

    socket.on("newSwapRequest", () => {
      fetchRequests();
    });

    return () => {
      socket.off("swapResponseUpdate");
      socket.off("newSwapRequest");
    };
  }, []);

  const respond = async (requestId, accept) => {
    await axiosClient.post(`/swap-response/${requestId}`, { accepted: accept });
    fetchRequests();
  };

  const list = tab === "incoming" ? incoming : outgoing;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Swap Requests</h2>
      <div className="flex mb-4">
        <button onClick={() => setTab("incoming")} className={`px-4 py-2 ${tab === "incoming" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Incoming
        </button>
        <button onClick={() => setTab("outgoing")} className={`px-4 py-2 ml-2 ${tab === "outgoing" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>
          Outgoing
        </button>
      </div>

      {list.length === 0 && <p>No {tab} requests.</p>}
      <ul>
        {list.map((req) => (
          <li key={req._id} className="border p-2 my-1 rounded flex justify-between">
            <span>
              {tab === "incoming" ? `From ${req.requesterId}` : `To ${req.receiverId}`} - {req.mySlotId.title} ⇄ {req.theirSlotId.title} ({req.status})
            </span>
            {tab === "incoming" && req.status === "PENDING" && (
              <div>
                <button className="bg-green-600 text-white px-2 py-1 mr-2 rounded" onClick={() => respond(req._id, true)}>Accept</button>
                <button className="bg-red-600 text-white px-2 py-1 rounded" onClick={() => respond(req._id, false)}>Reject</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
