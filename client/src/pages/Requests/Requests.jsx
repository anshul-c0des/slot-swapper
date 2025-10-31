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

    socket.on("swapResponseUpdate", (data) => {
      fetchRequests();
    });

    socket.on("newSwapRequest", () => {
      fetchRequests();
      toast.success("You have a new swap request!");
    });

    return () => {
      socket.off("swapResponseUpdate");
      socket.off("newSwapRequest");
    };
  }, []);

  const respond = async (requestId, accept) => {
    try {
      await axiosClient.post(`/swap-response/${requestId}`, { accepted: accept });
      fetchRequests();
      toast.success("Slot Swapped Successfully!")
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] p-6 bg-gray-50">
      <h2 className="text-2xl text-blue-400 ml-3 font-bold mb-4">Swap Requests</h2>
  
      <div className="flex mb-4">
        {["incoming", "outgoing", "history"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 font-semibold ml-2 border-2 border-transparent rounded-full cursor-pointer transition ${
              tab === t ? "text-white bg-blue-500 border-blue-500" : "bg-blue-100 text-blue-500"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

  
      {tab === "incoming" && (
        <>
          {incoming.length === 0 ? (
            <p className="text-gray-500 ml-3 mt-2">No incoming requests. Check back later.</p>
          ) : (
            <ul>
              {incoming.map((req) => (
                <li key={req._id} className="border p-3 my-3 rounded-xl ml-2 flex justify-between items-center border-blue-400 bg-blue-50/40 hover:bg-blue-50 text-md">
                  <span className="text-grat-600">
                    <span className="font-semibold text-gray-800">{req.requesterName.charAt(0).toUpperCase() + req.requesterName.slice(1)}</span> wants to swap their slot with yours.
                  </span>
                  {req.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => respond(req._id, true)} className="border-2 border-transparent text-green-600 font-semibold cursor-pointer transition bg-green-100 px-3 py-1 rounded-full hover:bg-green-400 hover:text-white hover:border-green-400 mr-1">Accept</button>
                      <button onClick={() => respond(req._id, false)} className="border-2 border-transparent text-red-500 font-semibold cursor-pointer transition bg-red-100 px-3 py-1 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500">Reject</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
  
      {tab === "outgoing" && (
        <>
        {outgoing.length === 0 ? (
            <p className="text-gray-500 ml-3 mt-2">Send a request to someone to see it here.</p>
          ) : (
          <ul className="ml-2">
            {outgoing.map((req) => (
              <li key={req._id} className="border border-amber-400 bg-amber-50/40 p-2 my-1 rounded-xl flex justify-between items-center">
                <span className="ml-2 text-gray-800">
                  Swap request to <span className="font-semibold">{req.receiverName.charAt(0).toUpperCase() + req.receiverName.slice(1)}</span> - Status: <span className="font-semibold">{req.status}</span>
                </span>
              </li>
            ))}
          </ul>
          )}
        </>
      )}

      {tab === "history" && (
        <>
          {history.length === 0 ? (
            <p className="text-gray-500 ml-3 mt-2">No swap history yet.</p>
          ) : (
            <div className="mb-5">
            <ul>
              {history.map((req) => (
                <li
                  key={req._id}
                  className={`border p-2 my-3 ml-2 rounded-xl flex justify-between items-center ${req.status === "ACCEPTED" ? "border-green-500 bg-green-50/40" : "border-red-500 bg-red-50/40"}`}
                >
                  <span>
                    <span className="ml-1 text-gray-600"> 
                      {req.type === "sent" ? "You sent a swap request to" : "You received a swap request from"} <span className="font-semibold">{req.type === "sent" ? req.receiverName.charAt(0).toUpperCase() + req.receiverName.slice(1) : req.requesterName.charAt(0).toUpperCase() + req.requesterName.slice(1)}</span> — Status:{" "}
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
            </div>
          )}
        </>
      )}
    </div>
  );  
}
