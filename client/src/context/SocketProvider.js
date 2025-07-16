import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socketInstance, setSocketInstance] = useState(null);
  const { currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!currentUser) return;

    const socket = io(
      process.env.REACT_APP_SOCKET_URL ||
        "https://mesdo-healthcare-1.onrender.com",
      {
        withCredentials: true,
        transports: ["websocket"], // 💡 Force websocket
        query: { userId: currentUser._id },
      }
    );

    socket.emit("joinUser", currentUser._id);

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    socketRef.current = socket;
    setSocketInstance(socket); // Triggers re-render to pass socket context

    return () => {
      socket.disconnect();
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  );
};
