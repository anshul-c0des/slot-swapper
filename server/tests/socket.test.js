import ioClient from "socket.io-client";
import server, { io, userSocketMap, notifyUser } from "../src/server.js";

const PORT = 5001; // test port
const SOCKET_URL = `http://localhost:${PORT}`;

let testServer;

beforeAll((done) => {
  // start test server
  testServer = server.listen(PORT, done);
});

afterAll((done) => {
  io.close();
  testServer.close(done);
});

describe("Slot swapping flow", () => {
  let clientA, clientB;

  beforeEach((done) => {
    // Connect two clients
    clientA = ioClient(SOCKET_URL);
    clientB = ioClient(SOCKET_URL);

    let connectedCount = 0;
    const checkConnected = () => {
      connectedCount++;
      if (connectedCount === 2) done();
    };

    clientA.on("connect", checkConnected);
    clientB.on("connect", checkConnected);
  });

  afterEach(() => {
    if (clientA.connected) clientA.disconnect();
    if (clientB.connected) clientB.disconnect();
    userSocketMap.clear(); // clear registered users
  });

  test("UserA requests slot swap with UserB, UserB receives it", (done) => {
    // Step 1: register users
    clientA.emit("register", "userA");
    clientB.emit("register", "userB");

    // Step 2: listen for swap request on UserB
    clientB.on("swap_request", (data) => {
      expect(data.from).toBe("userA");
      expect(data.slotId).toBe("slot123");
      done();
    });

    // Step 3: UserA triggers swap request via notifyUser
    setTimeout(() => {
      notifyUser("userB", "swap_request", {
        from: "userA",
        slotId: "slot123",
      });
    }, 50);
  });

  test("Broadcast swap to all if no user specified", (done) => {
    clientA.on("swap_broadcast", (data) => {
      expect(data.slotId).toBe("slot999");
      done();
    });

    setTimeout(() => {
      notifyUser(null, "swap_broadcast", { slotId: "slot999" });
    }, 50);
  });
});