import { useEffect, useState } from "react";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";
import useYouTubePlayer from "../hooks/useYouTubePlayer"; 

// Helper to convert seconds into M:SS format
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export default function Player({ songs, currentIndex, onIndexChange }) {
  const player = useYouTubePlayer();
  const currentSong = songs[currentIndex];
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (player.isReady && currentSong) {
      player.loadVideo(currentSong.youtubeId, hasInteracted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.isReady, currentIndex]);

  useEffect(() => {
    player.setOnEnded(() => {
      onIndexChange((currentIndex + 1) % songs.length);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, songs.length]);

  const handleNext = () => onIndexChange((currentIndex + 1) % songs.length);
  const handlePrev = () => onIndexChange((currentIndex - 1 + songs.length) % songs.length);
  
  const togglePlay = () => {
    setHasInteracted(true);
    player.isPlaying ? player.pause() : player.play();
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    player.seekTo(Math.min(Math.max(fraction, 0), 1));
  };

  if (!currentSong) return null;

  // Calculate the current playback time based on progress percentage and total duration
  const currentTime = player.progress * player.duration;

  return (
    // Fixed at bottom, wide horizontal pill shape with glassmorphism
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl text-cream font-body z-50">
      
      {/* Hidden iframe */}
      <div className="absolute top-0 left-0 w-full h-full opacity-0 -z-10 pointer-events-none overflow-hidden rounded-full">
        <div ref={player.containerRef} />
      </div>

      {/* Left: Album Art */}
      <div className="relative w-14 h-14 shrink-0 rounded-full p-1 border border-white/20 shadow-md">
        <img
          className={`w-full h-full object-cover rounded-full ${
            player.isPlaying ? "animate-[spin_4s_linear_infinite] motion-reduce:animate-none" : ""
          }`}
          src={`https://i.ytimg.com/vi/${currentSong.youtubeId}/hqdefault.jpg`}
          alt={currentSong.title}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black/80 rounded-full border border-white/20"></div>
      </div>

      {/* Middle: Info, Timestamps & Progress */}
      <div className="flex-1 flex flex-col min-w-0">
        <h2 className="font-display font-semibold text-lg leading-tight truncate text-white mb-0.5">
          {currentSong.title}
        </h2>
        
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-300 truncate w-32 shrink-0">{currentSong.artist}</p>
          
          <span className="text-[11px] font-medium text-gray-300 w-16 text-right shrink-0">
            {formatTime(currentTime)} / {formatTime(player.duration)}
          </span>
          
          <div
            className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer relative overflow-hidden group"
            onClick={handleSeek}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-[width] duration-200 ease-linear group-hover:bg-gold"
              style={{ width: `${player.progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-5 shrink-0 pl-2">
        <button
          onClick={handlePrev}
          aria-label="Previous track"
          className="text-white/70 hover:text-white active:scale-95 transition"
        >
          <SkipBack size={20} className="fill-current" />
        </button>
        <button
          onClick={togglePlay}
          aria-label={player.isPlaying ? "Pause" : "Play"}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition shadow-lg"
        >
          {player.isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
        </button>
        <button
          onClick={handleNext}
          aria-label="Next track"
          className="text-white/70 hover:text-white active:scale-95 transition"
        >
          <SkipForward size={20} className="fill-current" />
        </button>
      </div>
    </div>
  );
}