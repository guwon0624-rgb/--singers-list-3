// 정적 데모용 설정입니다. 실제 서비스에서는 TMDB 키를 서버 환경변수에 두고 프록시를 사용하세요.
const TMDB_API_KEY = "e88fbe81f4b5cace0f7f28e00b2c51df";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p/w780";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";

const artists = [
  {
    name: "IU",
    koreanName: "아이유",
    tmdbId: 1252318,
    profilePath: "/uNhKOO9lIAFXF11LM6gjCrX2CJz.jpg",
    genre: "K-POP",
    subgenre: "K-POP · SINGER-SONGWRITER",
    since: "2008",
    accent: "#c9b8ff",
    albumQuery: "IU",
    description: "섬세한 감성과 선명한 서사로 세대를 연결하는 싱어송라이터이자 아티스트.",
  },
  {
    name: "Billie Eilish",
    koreanName: "빌리 아일리시",
    tmdbId: 2413513,
    profilePath: "/4K69OtW6PVQ8gDozNB9Ja4j5iQS.jpg",
    genre: "POP",
    subgenre: "ALT POP · ELECTROPOP",
    since: "2015",
    accent: "#8fbdff",
    albumQuery: "Billie Eilish",
    description: "낮은 목소리와 실험적인 사운드로 동시대 팝의 감각을 새롭게 정의하는 아티스트.",
  },
  {
    name: "The Weeknd",
    koreanName: "더 위켄드",
    tmdbId: 1549008,
    profilePath: "/7s7Rhd5dalfg9lKX2NMIT5O2sBA.jpg",
    genre: "R&B",
    subgenre: "R&B · SYNTH POP",
    since: "2009",
    accent: "#ff6c61",
    albumQuery: "The Weeknd",
    description: "어두운 R&B와 영화적인 신스팝을 결합해 독보적인 세계관을 완성한 아티스트.",
  },
  {
    name: "Ariana Grande",
    koreanName: "아리아나 그란데",
    tmdbId: 226001,
    profilePath: "/d4HtCXm58GuqVJVGgDKFn0dEj8M.jpg",
    genre: "POP",
    subgenre: "POP · R&B",
    since: "2008",
    accent: "#f3b7d1",
    albumQuery: "Ariana Grande",
    description: "폭넓은 보컬 레인지와 세련된 팝 사운드로 자신만의 시대를 만든 글로벌 아티스트.",
  },
  {
    name: "Bruno Mars",
    koreanName: "브루노 마스",
    tmdbId: 969218,
    profilePath: "/imuRtakxrqON7dEqpZ831uYKi0e.jpg",
    genre: "R&B",
    subgenre: "POP · FUNK · R&B",
    since: "2004",
    accent: "#ffc95e",
    albumQuery: "Bruno Mars",
    description: "펑크와 소울, 팝을 자유롭게 오가며 무대를 장악하는 탁월한 퍼포머.",
  },
  {
    name: "Taylor Swift",
    koreanName: "테일러 스위프트",
    tmdbId: 212208,
    profilePath: "/rixYX4rVlWUhg0BWvclkFUNVYht.jpg",
    genre: "POP",
    subgenre: "POP · FOLK POP",
    since: "2003",
    accent: "#9fd6cb",
    albumQuery: "Taylor Swift",
    description: "개인적인 순간을 보편적인 이야기로 바꾸는 송라이팅으로 시대를 기록하는 아티스트.",
  },
];

const state = {
  currentIndex: 0,
  genre: "ALL",
  search: "",
  requestId: 0,
  albumCache: new Map(),
  detailsCache: new Map(),
};

const elements = {
  root: document.documentElement,
  heroNumber: document.querySelector("#heroNumber"),
  heroTotal: document.querySelector("#heroTotal"),
  heroName: document.querySelector("#heroName"),
  heroKoreanName: document.querySelector("#heroKoreanName"),
  heroDescription: document.querySelector("#heroDescription"),
  heroGenre: document.querySelector("#heroGenre"),
  heroSince: document.querySelector("#heroSince"),
  heroReleases: document.querySelector("#heroReleases"),
  heroPortrait: document.querySelector("#heroPortrait"),
  portraitLoader: document.querySelector("#portraitLoader"),
  heroBackdrop: document.querySelector("#heroBackdrop"),
  nowArtist: document.querySelector("#nowArtist"),
  artistList: document.querySelector("#artistList"),
  artistSearch: document.querySelector("#artistSearch"),
  genreFilters: document.querySelector("#genreFilters"),
  prevArtist: document.querySelector("#prevArtist"),
  nextArtist: document.querySelector("#nextArtist"),
  albumArtistName: document.querySelector("#albumArtistName"),
  albumCount: document.querySelector("#albumCount"),
  albumGrid: document.querySelector("#albumGrid"),
  dialog: document.querySelector("#albumDialog"),
  dialogClose: document.querySelector("#dialogClose"),
  dialogArtwork: document.querySelector("#dialogArtwork"),
  dialogGenre: document.querySelector("#dialogGenre"),
  dialogTitle: document.querySelector("#dialogTitle"),
  dialogArtist: document.querySelector("#dialogArtist"),
  dialogLink: document.querySelector("#dialogLink"),
};

function padNumber(number) {
  return String(number).padStart(2, "0");
}

function profileUrl(path, size = "w780") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
}

function normalizeText(value) {
  return value.toLocaleLowerCase().replace(/[\s.,'"()\-–—]/g, "");
}

function setLoadingAlbums() {
  elements.albumCount.textContent = "불러오는 중";
  elements.albumGrid.replaceChildren(
    ...Array.from({ length: 8 }, () => {
      const skeleton = document.createElement("div");
      skeleton.className = "album-skeleton";
      return skeleton;
    }),
  );
}

async function fetchArtistDetails(artist) {
  if (state.detailsCache.has(artist.tmdbId)) {
    return state.detailsCache.get(artist.tmdbId);
  }

  const url = `${TMDB_BASE_URL}/person/${artist.tmdbId}?api_key=${TMDB_API_KEY}&language=ko-KR`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TMDB 요청 실패: ${response.status}`);
  }

  const details = await response.json();
  state.detailsCache.set(artist.tmdbId, details);
  return details;
}

async function fetchAlbums(artist) {
  if (state.albumCache.has(artist.name)) {
    return state.albumCache.get(artist.name);
  }

  const params = new URLSearchParams({
    term: artist.albumQuery,
    entity: "album",
    country: "US",
    limit: "40",
  });
  const response = await fetch(`${ITUNES_SEARCH_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`앨범 요청 실패: ${response.status}`);
  }

  const data = await response.json();
  const targetName = normalizeText(artist.name);
  const uniqueAlbums = new Map();

  data.results
    .filter((album) => {
      const resultName = normalizeText(album.artistName || "");
      return resultName.includes(targetName) || targetName.includes(resultName);
    })
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
    .forEach((album) => {
      const key = normalizeText(album.collectionName || "");
      if (key && !uniqueAlbums.has(key)) {
        uniqueAlbums.set(key, album);
      }
    });

  const albums = [...uniqueAlbums.values()].slice(0, 12);
  state.albumCache.set(artist.name, albums);
  return albums;
}

function renderArtistCards() {
  const query = normalizeText(state.search);
  const filteredArtists = artists.filter((artist) => {
    const matchesGenre = state.genre === "ALL" || artist.genre === state.genre;
    const names = normalizeText(`${artist.name}${artist.koreanName}`);
    return matchesGenre && names.includes(query);
  });

  if (!filteredArtists.length) {
    const empty = document.createElement("p");
    empty.className = "empty-artists";
    empty.textContent = "검색 결과가 없습니다.";
    elements.artistList.replaceChildren(empty);
    return;
  }

  const cards = filteredArtists.map((artist) => {
    const originalIndex = artists.indexOf(artist);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `artist-card${originalIndex === state.currentIndex ? " is-active" : ""}`;
    card.setAttribute("aria-label", `${artist.koreanName} 선택`);
    card.dataset.index = originalIndex;

    const image = document.createElement("img");
    image.src = profileUrl(artist.profilePath, "w500");
    image.alt = `${artist.koreanName} 프로필`;
    image.loading = "lazy";

    const number = document.createElement("span");
    number.className = "artist-card-number";
    number.textContent = padNumber(originalIndex + 1);

    const copy = document.createElement("span");
    copy.className = "artist-card-copy";
    const name = document.createElement("strong");
    name.textContent = artist.name;
    const genre = document.createElement("span");
    genre.textContent = artist.subgenre;
    copy.append(name, genre);

    card.append(image, number, copy);
    card.addEventListener("click", () => selectArtist(originalIndex, true));
    return card;
  });

  elements.artistList.replaceChildren(...cards);
}

function renderAlbums(albums, artist) {
  elements.heroReleases.textContent = albums.length ? `${albums.length}+` : "—";
  elements.albumCount.textContent = `${albums.length} RELEASES`;

  if (!albums.length) {
    const empty = document.createElement("div");
    empty.className = "album-error";
    empty.textContent = "표시할 앨범을 찾지 못했습니다.";
    elements.albumGrid.replaceChildren(empty);
    return;
  }

  const cards = albums.map((album) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "album-card";
    card.setAttribute("aria-label", `${album.collectionName} 상세 보기`);

    const artwork = document.createElement("div");
    artwork.className = "album-artwork";
    const image = document.createElement("img");
    image.src = album.artworkUrl100.replace("100x100bb", "600x600bb");
    image.alt = `${album.collectionName} 앨범 표지`;
    image.loading = "lazy";
    artwork.append(image);

    const info = document.createElement("div");
    info.className = "album-info";
    const title = document.createElement("h3");
    title.textContent = album.collectionName;
    const year = document.createElement("time");
    year.dateTime = album.releaseDate;
    year.textContent = new Date(album.releaseDate).getFullYear();
    const genre = document.createElement("p");
    genre.textContent = album.primaryGenreName || artist.genre;
    info.append(title, year, genre);

    card.append(artwork, info);
    card.addEventListener("click", () => openAlbumDialog(album));
    return card;
  });

  elements.albumGrid.replaceChildren(...cards);
}

function renderAlbumError(artist) {
  elements.heroReleases.textContent = "—";
  elements.albumCount.textContent = "연결 오류";

  const error = document.createElement("div");
  error.className = "album-error";
  error.append("앨범 데이터를 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.");

  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "다시 시도";
  retry.addEventListener("click", () => {
    state.albumCache.delete(artist.name);
    loadAlbums(artist, state.requestId);
  });

  error.append(retry);
  elements.albumGrid.replaceChildren(error);
}

async function loadAlbums(artist, requestId) {
  try {
    const albums = await fetchAlbums(artist);
    if (requestId !== state.requestId) return;
    renderAlbums(albums, artist);
  } catch (error) {
    console.error(error);
    if (requestId === state.requestId) renderAlbumError(artist);
  }
}

async function enrichArtist(artist, requestId) {
  try {
    const details = await fetchArtistDetails(artist);
    if (requestId !== state.requestId) return;

    if (details.profile_path && details.profile_path !== artist.profilePath) {
      updatePortrait(details.profile_path, artist);
    }

    if (details.biography?.trim()) {
      elements.heroDescription.textContent = details.biography;
    }
  } catch (error) {
    console.warn("TMDB 상세 정보를 불러오지 못해 기본 정보를 표시합니다.", error);
  }
}

function updatePortrait(path, artist) {
  const imageUrl = profileUrl(path);
  elements.heroPortrait.classList.remove("is-loaded");
  elements.portraitLoader.classList.remove("is-hidden");
  elements.heroPortrait.alt = `${artist.koreanName} 아티스트 프로필`;
  elements.heroPortrait.src = imageUrl;
  elements.heroBackdrop.style.backgroundImage = `url("${imageUrl}")`;
}

function animateHeroCopy() {
  if (!elements.heroName.animate) return;

  [elements.heroName, elements.heroKoreanName].forEach((element, index) => {
    element.animate(
      [
        { opacity: 0, transform: "translateY(18px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 430,
        delay: index * 65,
        easing: "cubic-bezier(.2,.7,.2,1)",
      },
    );
  });
}

function selectArtist(index, scrollToAlbums = false) {
  const normalizedIndex = (index + artists.length) % artists.length;
  const artist = artists[normalizedIndex];
  state.currentIndex = normalizedIndex;
  state.requestId += 1;
  const requestId = state.requestId;

  elements.root.style.setProperty("--artist-accent", artist.accent);
  elements.heroNumber.textContent = padNumber(normalizedIndex + 1);
  elements.heroTotal.textContent = padNumber(artists.length);
  elements.heroName.textContent = artist.name;
  elements.heroKoreanName.textContent = artist.koreanName;
  elements.heroDescription.textContent = artist.description;
  elements.heroGenre.textContent = artist.genre;
  elements.heroSince.textContent = artist.since;
  elements.heroReleases.textContent = "—";
  elements.nowArtist.textContent = artist.name;
  elements.albumArtistName.textContent = artist.name;

  updatePortrait(artist.profilePath, artist);
  setLoadingAlbums();
  renderArtistCards();
  animateHeroCopy();
  loadAlbums(artist, requestId);
  enrichArtist(artist, requestId);

  if (scrollToAlbums) {
    document.querySelector("#albums").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function openAlbumDialog(album) {
  const artwork = album.artworkUrl100.replace("100x100bb", "900x900bb");
  elements.dialogArtwork.src = artwork;
  elements.dialogArtwork.alt = `${album.collectionName} 앨범 표지`;
  elements.dialogGenre.textContent =
    `${album.primaryGenreName || "MUSIC"} · ${new Date(album.releaseDate).getFullYear()}`;
  elements.dialogTitle.textContent = album.collectionName;
  elements.dialogArtist.textContent = album.artistName;
  elements.dialogLink.href = album.collectionViewUrl;
  elements.dialog.showModal();
}

elements.heroPortrait.addEventListener("load", () => {
  elements.heroPortrait.classList.add("is-loaded");
  elements.portraitLoader.classList.add("is-hidden");
});

elements.prevArtist.addEventListener("click", () => selectArtist(state.currentIndex - 1));
elements.nextArtist.addEventListener("click", () => selectArtist(state.currentIndex + 1));

elements.artistSearch.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderArtistCards();
});

elements.genreFilters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-genre]");
  if (!button) return;

  state.genre = button.dataset.genre;
  elements.genreFilters.querySelectorAll("button").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  renderArtistCards();
});

elements.dialogClose.addEventListener("click", () => elements.dialog.close());
elements.dialog.addEventListener("click", (event) => {
  const bounds = elements.dialog.getBoundingClientRect();
  const isBackdrop =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (isBackdrop) elements.dialog.close();
});

document.addEventListener("keydown", (event) => {
  if (elements.dialog.open) return;
  if (event.key === "ArrowLeft") selectArtist(state.currentIndex - 1);
  if (event.key === "ArrowRight") selectArtist(state.currentIndex + 1);
});

selectArtist(0);
