import { useState, useEffect } from "react";
import SpotifyAPI from "../services/SpotifyService";
import spotifyCredentials from "../config/spotifyCredentials";
import image from "../image.jpg";

const spotifyService = new SpotifyAPI(spotifyCredentials);

const SpotifyConnector = () => {
  const [isConnected, setIsConnected] = useState("pending");
  const [displayPunchline, setDisplayPunchline] = useState(false);

  useEffect(() => {
    console.log("useEffect");
    // In strict mode during development, React renders all components twice.
    // This produces errors as we try to handle a code callback twice.
    // Instead, we fire the handleCallback async function and immediately
    // clear the URL from the address bar in our useEffect to prevent
    // duplicate API calls.
    onPageLoad();
    window.history.pushState("", "", spotifyCredentials.redirect_uri);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestAuthorization = () => {
    window.location.href = spotifyService.makeAuthorizeRequestURL();
  };

  const onPageLoad = async () => {
    // If we have been redirected back to this page after authorizing our app
    // with Spotify, there will be a one-time use authorization code in the
    // search parameters of the address bar. We want to grab it and use it to
    // get our access tokens (whilst also erasing it from the address bar).
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) await spotifyService.fetchTokens(code);

    // We would also like to check whether we have an access token in local
    // storage and that it is up to date. Refreshing the token is a more direct
    // way to ensure that it is valid and our SpotifyService can manage local
    // storage on our behalf.
    if (await spotifyService.refreshAccessToken()) {
      setIsConnected("connected");
      injectSpotifyWebPlayer();
      activatePunchline();
    } else {
      setIsConnected("disconnected");
    }
  };

  const injectSpotifyWebPlayer = () => {
    console.log("Injecting Spotify web player");
    // This is a bit of a hacky way to conditionally inject the Spotify Web
    // Player script only once we have connected to Spotify.
    const sdkScript = document.createElement('script');
    sdkScript.src = "https://sdk.scdn.co/spotify-player.js"

    // We're also going to grab the device_id of our newly created web player
    // and store it in session storage for retrieval by the component.
    const initScript = document.createElement('script');
    initScript.textContent = `
      window.onSpotifyWebPlaybackSDKReady = () => {
        const token = "${spotifyService.access_token}";
        const player = new Spotify.Player({
          name: 'U GOT ROLLED',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5
        });
        player.addListener("initialization_error", () => {
          console.log("Initialization error");
        });
        player.addListener("not_ready", () => {
          console.log("Not ready");
        });
        player.addListener("authentication_error", () => {
          console.log("Authentication error");
        });
        player.addListener("account_error", () => {
          console.log("Account error"); 
        });
        player.addListener("ready", ({ device_id }) => {
          console.log("Ready");
          sessionStorage.setItem("device_id", device_id);
        });
        player.connect();
      }
    `

    document.body.appendChild(sdkScript);
    document.body.appendChild(initScript);
  }

  const activatePunchline = () => {
    setTimeout(async () => {
      const device_id = sessionStorage.getItem("device_id");
      if (device_id) {
        // await spotifyService.transferPlayback({ device_id, play: true });
        // await spotifyService.startResumePlayback({ device_id, uris: ["spotify:track:4cOdK2wGLETKBW3PvgPWqT"] });
        setDisplayPunchline(true);
      };
    }, 3000);

  }

  return (
    <>
      {isConnected === "disconnected" ? (
        <button className="connect-button" onClick={requestAuthorization}>Connect to Spotify</button>
      ) : (
      displayPunchline && <img className="punchline" src={image} alt="" />
      )}
    </>
  );
};

export default SpotifyConnector;
