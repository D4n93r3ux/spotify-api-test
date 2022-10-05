import { Buffer } from "buffer";
import axios from "axios";

export default class SpotifyAPI {
  AUTHORIZE = "https://accounts.spotify.com/authorize";
  TOKEN = "https://accounts.spotify.com/api/token";
  API = "https://api.spotify.com/v1";

  client_id: string;
  client_secret: string;
  redirect_uri: string;
  access_token = localStorage.getItem("access_token");
  refresh_token = localStorage.getItem("refresh_token");
  scope = [
    // --- Images---
    // "ugc-image-upload",
    // --- Spotify Connect
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    // Playback
    "app-remote-control",
    "streaming",
    // Playlists
    // "playlist-read-private",
    // "playlist-read-collaborative",
    // "playlist-modify-private",
    // "playlist-modify-collaborative",
    // Follow
    // "user-follow-modify",
    // "user-follow-read",
    // Listening History
    "user-read-playback-position",
    // "user-top-read",
    // "user-read-recently-played",
    // Library
    // "user-library-modify",
    // "user-library-read",
    // Users
    "user-read-email",
    "user-read-private",
  ];

  constructor({
    client_id,
    client_secret,
    redirect_uri,
  }: {
    client_id: string;
    client_secret: string;
    redirect_uri: string;
  }) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.redirect_uri = redirect_uri;
  }

  makeAuthorizeRequestURL() {
    const params = new URLSearchParams();
    params.append("client_id", this.client_id);
    params.append("response_type", "code");
    params.append("redirect_uri", this.redirect_uri);
    params.append("show_dialog", "true");
    params.append("scope", this.scope.join(" "));

    return `${this.AUTHORIZE}?${params.toString()}`;
  }

  async fetchTokens(code: string) {
    console.log("Fetching tokens");
    const body = new URLSearchParams();
    body.append("grant_type", "authorization_code");
    body.append("code", code);
    body.append("redirect_uri", this.redirect_uri);

    const headers = {
      Authorization:
        "Basic " +
        Buffer.from(`${this.client_id}:${this.client_secret}`).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    };

    try {
      const res = await axios.post(this.TOKEN, body, { headers });
      if (res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        this.access_token = res.data.access_token;
      }
      if (res.data.refresh_token) {
        localStorage.setItem("refresh_token", res.data.refresh_token);
        this.refresh_token = res.data.refresh_token;
      }
    } catch (err) {
      console.error(err);
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    console.log("Refreshing access token");
    if (!this.refresh_token) {
      return false;
    }

    const body = new URLSearchParams();
    body.append("grant_type", "refresh_token");
    body.append("refresh_token", this.refresh_token);

    const headers = {
      Authorization:
        "Basic " +
        Buffer.from(`${this.client_id}:${this.client_secret}`).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    };

    try {
      const res = await axios.post(this.TOKEN, body, { headers });
      if (res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        this.access_token = res.data.access_token;
        return true;
      } else return false;

    } catch (err) {
      console.error("Bad refresh token");
      console.error(err);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      return false;
    }
  }

  async makeAPICall({
    endpoint,
    method,
    data,
  }: {
    endpoint: string;
    method: string;
    data?: unknown;
  }) {
    if (!this.refresh_token) {
      console.error("Authorization with Spotify required.");
    }

    try {
      await this.refreshAccessToken();
    } catch (err) {
      console.error("Unable to refresh access token");
      console.error(err);
      localStorage.delete("access_token");
      localStorage.delete("refresh_token");
      return;
    }

    const headers = {
      Authorization: "Bearer " + this.access_token,
    };

    try {
      const res = await axios.request({
        url: this.API + endpoint,
        method,
        headers,
        data,
      });
      return res.data;
    } catch (err) {
      console.error(err);
    }
  }

  // ------------------------------------------------ ALBUMS
  // ------------------------------------------------ ARTISTS
  // ------------------------------------------------ SHOWS
  // ------------------------------------------------ EPISODES
  // ------------------------------------------------ AUDIOBOOKS
  // ------------------------------------------------ CHAPTERS
  // ------------------------------------------------ TRACKS
  // ------------------------------------------------ SEARCH
  // ------------------------------------------------ USERS
  // ------------------------------------------------ PLAYLISTS
  // ------------------------------------------------ CATEGORIES
  // ------------------------------------------------ GENRES

  // ------------------------------------------------ PLAYER

  // getPlaybackState
  transferPlayback = async ({
    device_id,
    play,
  }: {
    device_id: string;
    play?: boolean;
  }) => {
    return await this.makeAPICall({
      endpoint: "/me/player",
      method: "put",
      data: {
        device_ids: [device_id],
        play,
      },
    });
  };

  getAvailableDevices = async () => {
    return await this.makeAPICall({
      endpoint: "/me/player/devices",
      method: "get",
    });
  };

  // getCurrentlyPlayingTrack

  startResumePlayback = async ({ device_id, uris }: { device_id?: string, uris?: [string] }) => {
    console.log("Starting / resuming playback");
    const params = new URLSearchParams();
    if (device_id) params.append("device_id", device_id);

    return await this.makeAPICall({
      endpoint: "/me/player/play?" + params.toString(),
      method: "put",
      data: {
        uris
      },
    });
  };

  pausePlayback = async () => {
    return await this.makeAPICall({
      endpoint: "/me/player/pause",
      method: "put",
    });
  };

  // skipToNext
  // skipToPrevious
  // seekToPosition
  // setRepeatMode
  // setPlaybackVolume
  // togglePlaybackShuffle
  // getRecentlyPlayedTracks
  // getTheUsersQueue

  addItemToPlaybackQueue = async ({ uri, device_id }: { uri?: string; device_id?: string }) => {
    // TODO: Fix this
    const params = new URLSearchParams();
    if (uri) params.append("uri", uri);
    if (device_id) params.append("device_id", device_id);

    return await this.makeAPICall({
      endpoint: "/me/player/queue?" + params.toString(),
      method: "post",
    })
  }

  // ------------------------------------------------ MARKETS
}
