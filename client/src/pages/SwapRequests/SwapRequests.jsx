import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import socket from "../../socket";

export default function SwapRequests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  const fetchRequests = async () => {
    const [inc, out] = await Promise.all([
      axiosClient.get("/swap-requests/incoming"),
      axiosClient.get("/swap-requests/outgoing"),
    ]);
    setIncoming(inc.data);
    setOutgoing(out.data);
  };

  useEffect(() => {
    fetchRequests();
    socket.on("newRequest", fetchRequests);
    socket.on("responseUpdate", fetchRequests);
    return () => {
      socket.off("newRequest", fetchRequests);
      socket.off("responseUpdate", fetchRequests);
    };
  }, []);

  const respondToRequest = async (id, accepted) => {
    await axiosClient.post(`/swap-response/${id}`, { accepted });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Incoming Requests</h2>
      {incoming.map((req) => (
        <div key={req._id} className="border p-3 my-2 rounded flex justify-between">
          <div>
            <b>{req.requesterId?.name}</b> wants to swap
            {" "}
            <b>{req.theirSlotId?.title}</b> for your <b>{req.mySlotId?.title}</b>
          </div>
          {req.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => respondToRequest(req._id, true)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest(req._id, false)}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      <h2 className="text-2xl font-bold mt-8 mb-4">Outgoing Requests</h2>
      {outgoing.map((req) => (
        <div key={req._id} className="border p-3 my-2 rounded">
          You requested <b>{req.theirSlotId?.title}</b> →
          Status: <b>{req.status}</b>
        </div>
      ))}
    </div>
  );
}
