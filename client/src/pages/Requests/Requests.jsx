import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket";

export default function Requests() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("incoming");

  const fetchRequests = async () => {
    try {
      const [incRes, outRes, histRes] = await Promise.all([
        axiosClient.get("/incoming"),
        axiosClient.get("/outgoing"),
        axiosClient.get("/history"),
      ]);

      setIncoming(incRes.data);
      console.log(incRes.data);
      
      setOutgoing(outRes.data);
      setHistory(histRes.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchRequests();

    socket.on("responseUpdate", (data) => {
      fetchRequests();
      alert(`Swap ${data.status.toLowerCase()}!`);
    });

    socket.on("newSwapRequest", () => {
      fetchRequests();
      toast.success("You have a new swap request!");
    });

    return () => {
      socket.off("responseUpdate");
      socket.off("newSwapRequest");
    };
  }, []);

  const respond = async (requestId, accept) => {
    try {
      await axiosClient.post(`/swap-response/${requestId}`, { accepted: accept });
      fetchRequests();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Swap Requests</h2>
  
      <div className="flex mb-4">
        {["incoming", "outgoing", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 ml-2 ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

  
      {/* Incoming Requests */}
      {tab === "incoming" && (
        <>
          {incoming.length === 0 ? (
            <p>No incoming requests.</p>
          ) : (
            <ul>
              {incoming.map((req) => (
                <li key={req._id} className="border p-2 my-1 rounded flex justify-between items-center">
                  <span>
                    {req.requesterName} wants to swap their slot with yours.
                  </span>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => respond(req._id, true)} className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700">Accept</button>
                      <button onClick={() => respond(req._id, false)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
  
      {/* Outgoing Requests */}
      {tab === "outgoing" && (
        <>
        {outgoing.length === 0 ? (
            <p>No swap outgoing yet.</p>
          ) : (
          <ul>
            {outgoing.map((req) => (
              <li key={req._id} className="border p-2 my-1 rounded flex justify-between items-center">
                <span>
                  Swap request to {req.receiverName} — Status: {req.status}
                </span>
              </li>
            ))}
          </ul>
          )}
        </>
      )}

      {/* Swap History */}
      {tab === "history" && (
        <>
          {history.length === 0 ? (
            <p>No swap history yet.</p>
          ) : (
            <ul>
              {history.map((req) => (
                <li
                  key={req._id}
                  className="border p-2 my-1 rounded flex justify-between items-center"
                >
                  <span>
                    <span>
                      {req.type === "sent" ? "You sent a swap request to" : "You received a swap request from"} <span className="font-semibold">{req.type === "sent" ? req.receiverName : req.requesterName}</span> — Status:{" "}
                    </span>
                    <strong className={
                      req.status === "ACCEPTED"
                        ? "text-green-600"
                        : req.status === "REJECTED"
                        ? "text-red-600"
                        : "text-gray-500"
                    }>
                      {req.status}
                    </strong>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );  
}
