"use strict";

const audio = document.querySelector("#audio");
const playPauseButton = document.querySelector("#play-pause");
const previousButton = document.querySelector("#prev-track");
const nextButton = document.querySelector("#next-track");
const progress = document.querySelector("#progress");
const volume = document.querySelector("#volume");
const currentTimeLabel = document.querySelector("#current-time");
const durationLabel = document.querySelector("#duration");
const trackTitle = document.querySelector("#player-track-title");
const playerStatus = document.querySelector("#player-status");
const trackItems = [...document.querySelectorAll(".track-item")];
const trackButtons = [...document.querySelectorAll(".track-select")];

const tracks = [
    { title: "The End of Everything", file: "1. The End of Everything.mp3" },
    { title: "Rain", file: "2. Rain.mp3" },
    { title: "Pull Harder on the Strings of Your Martyr", file: "3. Pull Harder on the Strings of Your Martyr.mp3" },
    { title: "Drowned and Torn Asunder", file: "4. Drowned and Torn Asunder.mp3" },
    { title: "Ascendancy", file: "5. Ascendancy.mp3" },
    { title: "A Gunshot to the Head of Trepidation", file: "6. A Gunshot to the Head of Trepidation.mp3" },
    { title: "Like Light to the Flies", file: "7. Like Light to the Flies.mp3" },
    { title: "Dying in Your Arms", file: "8. Dying in Your Arms.mp3" },
    { title: "The Deceived", file: "9. The Deceived.mp3" },
    { title: "Suffocating Sight", file: "10. Suffocating Sight.mp3" },
    { title: "Departure", file: "11. Departure.mp3" },
    { title: "Declaration", file: "12. Declaration.mp3" }
];

let currentTrackIndex = 0;

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function setStatus(message) {
    if (playerStatus) {
        playerStatus.textContent = message;
    }
}

function updatePlayButton(isPlaying) {
    if (!playPauseButton) return;

    playPauseButton.textContent = isPlaying ? "Ⅱ" : "▶";
    playPauseButton.setAttribute(
        "aria-label",
        isPlaying ? "Pause" : "Play"
    );
}

function updateActiveTrack() {
    trackItems.forEach((item, index) => {
        item.classList.toggle("active", index === currentTrackIndex);
    });

    trackButtons.forEach((button, index) => {
        button.classList.toggle("active", index === currentTrackIndex);
    });
}

function updateProgress() {
    if (!audio) return;

    if (currentTimeLabel) {
        currentTimeLabel.textContent = formatTime(audio.currentTime);
    }

    if (durationLabel) {
        durationLabel.textContent = formatTime(audio.duration);
    }

    if (
        progress &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
    ) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    }
}

function loadTrack(index, autoplay = false) {
    if (!audio || tracks.length === 0) return;

    currentTrackIndex = (index + tracks.length) % tracks.length;

    const track = tracks[currentTrackIndex];

    audio.src = `assets/audio/${encodeURIComponent(track.file)}`;
    audio.load();

    if (trackTitle) {
        trackTitle.textContent = track.title;
    }

    if (progress) {
        progress.value = 0;
    }

    if (currentTimeLabel) {
        currentTimeLabel.textContent = "0:00";
    }

    if (durationLabel) {
        durationLabel.textContent = "0:00";
    }

    updateActiveTrack();
    updatePlayButton(false);
    setStatus("Ready to play");

    if (autoplay) {
        playTrack();
    }
}

async function playTrack() {
    if (!audio) return;

    try {
        await audio.play();
        updatePlayButton(true);
        setStatus("Now playing");
    } catch (error) {
        updatePlayButton(false);
        setStatus("Could not play this track. Check the audio file.");
        console.error("Audio playback error:", error);
    }
}

function pauseTrack() {
    if (!audio) return;

    audio.pause();
    updatePlayButton(false);
    setStatus("Paused");
}

function togglePlayPause() {
    if (!audio) return;

    if (audio.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
}

function nextTrack() {
    loadTrack(currentTrackIndex + 1, true);
}

function previousTrack() {
    if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    loadTrack(currentTrackIndex - 1, true);
}

function seekTrack() {
    if (!audio || !progress) return;

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
}

function changeVolume() {
    if (!audio || !volume) return;

    audio.volume = Math.max(
        0,
        Math.min(1, Number(volume.value))
    );
}

function selectTrack(index) {
    loadTrack(index, true);
}

if (audio) {
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    audio.addEventListener("play", () => {
        updatePlayButton(true);
        setStatus("Now playing");
    });

    audio.addEventListener("pause", () => {
        updatePlayButton(false);
    });

    audio.addEventListener("ended", nextTrack);

    audio.addEventListener("error", () => {
        updatePlayButton(false);
        setStatus(
            `Unable to load: ${tracks[currentTrackIndex].file}`
        );
        console.error(
            "Failed to load audio:",
            audio.currentSrc || audio.src
        );
    });

    if (volume) {
        audio.volume = Math.max(
            0,
            Math.min(1, Number(volume.value))
        );

        volume.addEventListener("input", changeVolume);
    }
}

if (playPauseButton) {
    playPauseButton.addEventListener("click", togglePlayPause);
}

if (previousButton) {
    previousButton.addEventListener("click", previousTrack);
}

if (nextButton) {
    nextButton.addEventListener("click", nextTrack);
}

if (progress) {
    progress.addEventListener("input", seekTrack);
}

trackButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        selectTrack(index);
    });
});

trackItems.forEach((item, index) => {
    item.addEventListener("click", (event) => {
        if (event.target.closest(".track-select")) return;
        selectTrack(index);
    });
});

loadTrack(0);

/* SPACEBAR: play / pause */

function isTypingTarget(target) {
    if (!target) return false;

    if (target.isContentEditable) return true;

    const tag = target.tagName;

    if (tag === "TEXTAREA" || tag === "SELECT") return true;

    if (tag === "INPUT") {
        // range sliders (progress, volume) don't use space, so allow it there
        return target.type !== "range" && target.type !== "button";
    }

    return false;
}

function isSpace(event) {
    return event.code === "Space" || event.key === " ";
}

document.addEventListener("keydown", (event) => {
    if (!isSpace(event) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;

    // stop page scrolling and stop a focused button from "clicking"
    event.preventDefault();

    if (!event.repeat) {
        togglePlayPause();
    }
});

document.addEventListener("keyup", (event) => {
    if (!isSpace(event)) return;
    if (isTypingTarget(event.target)) return;

    // browsers fire a button click on Space keyup; cancel it
    event.preventDefault();
});