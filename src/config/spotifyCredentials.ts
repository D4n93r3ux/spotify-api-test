if (!process.env.REACT_APP_SPOTIFY_CLIENT_ID) {
  throw new Error("No client ID found");
}

if (!process.env.REACT_APP_SPOTIFY_CLIENT_SECRET) {
  throw new Error("No client secret found");
}

if (!process.env.REACT_APP_SPOTIFY_REDIRECT_URI) {
  throw new Error("No redirect URI found");
}

const spotifyCredentials = {
  client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  client_secret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET,
  redirect_uri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
};

export default spotifyCredentials;
