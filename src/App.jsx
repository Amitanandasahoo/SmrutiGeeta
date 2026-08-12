import { useState, useEffect } from "react";
import Player from "./components/Player";
import songs from "./assets/Song";
import bgImage from "./assets/bg_IMG.png";

// Creates the live clock shown in the top left
const TopClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  }).toLowerCase();

  return (
    <div className="absolute top-6 left-8 text-white/90 font-medium text-lg tracking-wide drop-shadow-md z-10">
      {timeString}
    </div>
  );
};

// HELPER: Calculates which track should be playing right now based on global real-world time
const getLiveTrackIndex = (totalSongs) => {
  if (!totalSongs) return 0;
  
  // Assuming an average track length of 5 minutes (300,000 milliseconds)
  const avgTrackLengthMs = 5 * 60 * 1000; 
  
  // Get current global time
  const currentTimeMs = Date.now(); 
  
  // Calculate how many total 5-minute blocks have passed since 1970
  const totalTracksPlayed = Math.floor(currentTimeMs / avgTrackLengthMs);
  
  // Modulo the result by your playlist length to find the current live track!
  return totalTracksPlayed % totalSongs;
};

function App() {
  // Instead of starting at 0, we start at the synchronized Live Radio index
  const [currentIndex, setCurrentIndex] = useState(() => getLiveTrackIndex(songs.length));

  return (
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