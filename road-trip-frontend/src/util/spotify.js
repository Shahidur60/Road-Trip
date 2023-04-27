export const authEndpoint = "https://accounts.spotify.com/authorize";
const redirectURI = "https://triphala.tk/playlist";
const clientID = "117454ab2d384785b461a9e84b27602f";
const scopes = ["playlist-read-private", "playlist-read-collaborative", "playlist-modify-private", "playlist-modify-public"]
export const loginURL = `${authEndpoint}?client_id=${clientID}&redirect_uri=${redirectURI}&scope=${scopes.join("%20")}&response_type=token&show_dialog=true`;

export const playlistEndpoint = "https://api.spotify.com/v1/me/playlists";
export const profileEndpoint = "https://api.spotify.com/v1/me"

const endpoint_url = "https://api.spotify.com/v1/recommendations"

export const recommendPlaylistEndpoint = `${endpoint_url}?limit=`
export const recommendPlaylistEndpointPart2 = `&market=${"US"}&target_danceability=${0.9}`;