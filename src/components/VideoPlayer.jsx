import { useEffect, useRef } from "react";

const VideoPlayer = ({ stream }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      autoPlay
      muted
      className="rounded-md border border-gray-300 w-64 h-48 object-cover"
    />
  );
};

export default VideoPlayer;
