let currentSong = new Audio();
currentSong.src;
let currentSongIndex = 0;
let songTime;
let currFolder = "songs/ncs"; 
let lastVol;

function updateTime() {
  document.querySelector(".songTime").innerHTML = songTime;
}

const playMusic = (audio, pause = false) => {
  // Getting the path for the song
  let decodedAudio = decodeURIComponent(`/${currFolder}/` + audio);
  decodedAudio = decodedAudio.replace(/%20/g, " "); // Replace all %20 with spaces
  currentSong.src = decodedAudio;

  // Displaying only the song name without additional BS stuff
  let songInfo = decodedAudio.split(`/${currFolder}/`)[1];
  songInfo = songInfo.replace(/%20/g, " "); // Replace all %20 with spaces
  document.querySelector(".songInfo").innerHTML = songInfo.split(".mp3")[0];

  // Play the target song
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  console.log(currentSongIndex);
};

async function getSongs(folder) {
  songs = [];
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  for (let i = 0; i < as.length; i++) {
    const element = as[i];
    if (element.href.endsWith(".mp3")) {
      let songUrl = element.href.split(`/${folder}/`)[1];
      let decodedUrl = decodeURIComponent(songUrl);
      songs.push(decodedUrl);
    }
  }

  //Code to add songs
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
            <img class="invert" src="music.svg" alt="">
            <div class="info">
            <div>${song.replaceAll("%20", "")}</div>
            <div>Umer </div>
            </div>
            <div class="playnow flex">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
            </div></li>`;
  }

  //Attaching Event Listener to songs list
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e, index) => {
    e.addEventListener("click", (element) => {
      currentSongIndex = index;
      playMusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];      
    
    if (e.href.includes("/songs")) {
      let folderName = e.href.split("/").slice(-2)[0];

      //Getting the data for the folder
      let a = await fetch(
        `http://127.0.0.1:3000/songs/${folderName}/info.json`
      );
      let response = await a.json();
      // console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folderName}" class="card p1">
      <div class="play">
          <div style="width: 43px; height: 43px; border-radius: 50%; background-color: lightgreen; display: flex; justify-content: center; align-items: center;">
              <div style="width: 30px; height: 30px; display: flex; justify-content: center; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="black">
                  <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
              </div>
          </div>
  </div>
      <img class="fit" src="/songs/${folderName}/cover.jpeg" alt="" width="99%">
      <h2>${response.title}</h2>
      <p>${response.description}</p>
  </div> `;
    }
  };

  //Loading the playlists within the cards
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      // Access the target of the event (the element that was clicked)
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

async function main() {
  await getSongs(currFolder);

  displayAlbums();

  if (songs.length > 0) {
    playMusic(songs[currentSongIndex], true);
  } else {
    console.error("No songs found.");
    // Handle case where no songs are found
  }

  //Attaching Event listener for pause and play
  play.addEventListener("click", () => {
    // console.log("ur");?
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  //Add Action listener for next and previous buttons
  previous.addEventListener("click", () => {
    currentSongIndex--;
    if (currentSongIndex < 0) {
      currentSongIndex = 0; // Wrap around to the last song
    }
    playMusic(songs[currentSongIndex], false);
  });
  next.addEventListener("click", () => {
    currentSongIndex++;
    if (currentSongIndex >= songs.length) {
      currentSongIndex = 0; // Wrap around to the first song
    }
    playMusic(songs[currentSongIndex], false);
  });

  //Listen for time update event
  currentSong.addEventListener("timeupdate", () => {
    let ongoing = formatTime(currentSong.currentTime);
    let totalTime = formatTime(currentSong.duration);
    document.querySelector(".songTime").innerHTML = `${ongoing} / ${totalTime}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
}

//Add an event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  // Calculate click position relative to the seekbar
  const clickPosition =
    e.clientX - document.querySelector(".seekbar").getBoundingClientRect().left;
  const seekbarWidth = document.querySelector(".seekbar").clientWidth;

  // Calculate percentage based on click position
  const clickPercentage = (clickPosition / seekbarWidth) * 100;

  // Update circle and progress bar position
  document.querySelector(".circle").style.left = clickPercentage + "%";

  //Updating the song's time
  currentSong.currentTime = (currentSong.duration * clickPercentage) / 100;
});

//Add Action listener for hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = 0;
});

//Add Action listener for cross
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = -200 + "%";
});

//Add an event for volume
document
  .querySelector(".range")
  .getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    lastVol = currentSong.volume;
    let image = document.querySelector(".volume>img")
    image.src = "volume.svg"
  });
  document.querySelector(".volume>img").addEventListener("click", (e)=>{
    if(!currentSong.volume){
      currentSong.volume = lastVol;
      e.target.src = "volume.svg"
    }
    else{
      lastVol = currentSong.volume;
      currentSong.volume = 0;
      e.target.src = "mute.svg"
    }
  })

function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}
main();
