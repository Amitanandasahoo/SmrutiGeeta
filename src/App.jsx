import { useState, useEffect } from "react";
import Player from "./components/Player";
import songs from "./assets/Song";
import bgImage from "./assets/bg_IMG.png";

// Creates the live clock shown in the top left of the screenshot
const TopClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  }).toLowerCase(); // e.g., "3:56 pm"

  return (
    <div className="absolute top-6 left-8 text-white/90 font-medium text-lg tracking-wide drop-shadow-md z-10">
      {timeString}
    </div>
  );
};

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    // Added 'relative' to allow the absolute positioning of the clock and player
    <div
      className="relative min-h-screen w-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <TopClock />
      <Player songs={songs} currentIndex={currentIndex} onIndexChange={setCurrentIndex} />
    </div>
  );
}

export default App;