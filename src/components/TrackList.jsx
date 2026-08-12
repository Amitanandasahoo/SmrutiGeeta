export default function TrackList({ songs, currentIndex, onSelect }) {
  return (
    <div className="max-w-[380px] mx-auto mt-5 flex flex-col gap-1 max-h-80 overflow-y-auto">
      {songs.map((song, i) => {
        const isActive = i === currentIndex;
        return (
          <button
            key={song.id}
            onClick={() => onSelect(i)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
              isActive ? "bg-maroon" : "bg-transparent hover:bg-cream"
            }`}
          >
            <img
              src={`https://i.ytimg.com/vi/${song.youtubeId}/default.jpg`}
              alt=""
              className="w-10 h-10 rounded-md object-cover shrink-0"
            />
            <span className={`text-xs w-5 shrink-0 ${isActive ? "text-cream" : "text-[#a89484]"}`}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex flex-col min-w-0">
              <span className={`text-sm font-medium truncate ${isActive ? "text-cream" : "text-walnut"}`}>
                {song.title}
              </span>
              <span className={`text-xs ${isActive ? "text-gold" : "text-[#8a7a6d]"}`}>
                {song.artist}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}