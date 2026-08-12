import { useEffect, useRef, useState, useCallback } from "react";

// Loads the YouTube IFrame API script once, no matter how many components use this hook
let apiPromise = null;
function loadYouTubeAPI() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
  return apiPromise;
}

export default function useYouTubePlayer() {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const onEndedRef = useRef(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let isMounted = true; // Track if the component is actively rendered

    loadYouTubeAPI().then((YT) => {
      // Prevent creating the player if React already unmounted this instance
      if (!isMounted || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        height: "200", // Standard size to prevent browser from killing it in background tabs
        width: "200",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          enablejsapi: 1, // Required for custom play button controls
          origin: window.location.origin, // Required for cross-origin security
        },
        events: {
          onReady: () => setIsReady(true),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setDuration(playerRef.current.getDuration());
            }
            if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false);
            if (e.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onEndedRef.current?.();
            }
          },
          onError: (e) => {
            console.error("YouTube Player Error Code:", e.data);
            if (e.data === 150 || e.data === 101) {
              console.error("This specific video restricts playback outside of YouTube. You will need to find a different YouTube ID for this song (e.g., a lyrical video or fan upload).");
            }
          }
        },
      });
    });

    // Destroy the ghost player when React StrictMode double-renders
    return () => {
      isMounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Poll progress while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (p?.getCurrentTime && p?.getDuration) {
        const total = p.getDuration();
        if (total) setProgress(p.getCurrentTime() / total);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const loadVideo = useCallback((youtubeId, shouldPlay = false) => {
    if (playerRef.current) {
      // If user interacted, autoplay next track. Otherwise, just cue it.
      if (shouldPlay && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(youtubeId);
      } else if (playerRef.current.cueVideoById) {
        playerRef.current.cueVideoById(youtubeId);
      }
      setProgress(0);
    }
  }, []);

  const play = useCallback(() => playerRef.current?.playVideo?.(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo?.(), []);

  const seekTo = useCallback(
    (fraction) => {
      if (playerRef.current?.seekTo && duration) {
        playerRef.current.seekTo(fraction * duration, true);
      }
    },
    [duration]
  );

  const setOnEnded = useCallback((fn) => {
    onEndedRef.current = fn;
  }, []);

  return {
    containerRef, 
    isReady,
    isPlaying,
    progress,
    duration,
    loadVideo,
    play,
    pause,
    seekTo,
    setOnEnded,
  };
}