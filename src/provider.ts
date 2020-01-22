import axios from 'axios';
import { Parser } from 'm3u8-parser';

const userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"

export function parseStream(streamResponse) {
    const parser = new Parser();
    parser.push(streamResponse.data);
    parser.end();
    return parser.manifest;
}

export function extractAudioStream(streamManifest) {
    return streamManifest.playlists.find(playlist => {
        const attributes = playlist['attributes'];
        return attributes['VIDEO'] === "audio_only";
    });
}

function randomInteger(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export async function makeKrakenUserRequest(channelName: string) {
    return axios.get(
        `https://api.twitch.tv/kraken/users.json`,
        {
            params: {
                'as3': 't',
                'login': channelName
            },
            headers: {
                'accept': 'application/vnd.twitchtv.v5+json',
                'accept-encoding': 'gzip, deflate',
                'client-id': 'pwkzresl8kj2rdj6g7bvxl9ys1wly3j',
            }
        }
    );
}

export async function makeTmiRequest(hostId: string) {
    return axios.get(
        `https://tmi.twitch.tv/hosts`,
        {
            params: {
                'as3': 't',
                'include_logins': '1',
                'host': hostId
            },
            headers: {
                'accept': 'application/vnd.twitchtv.v5+json',
                'accept-encoding': 'gzip, deflate',
                'client-id': 'pwkzresl8kj2rdj6g7bvxl9ys1wly3j',
            }
        }
    );
}

export async function makeAccessTokenRequest(channelName: string) {
    return axios.get(
        `https://api.twitch.tv/api/channels/${channelName}/access_token.json`,
        {
            params: {
                'as3': 't'
            },
            headers: {
                'accept': 'application/vnd.twitchtv.v5+json',
                'accept-encoding': 'gzip, deflate',
                'client-id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
            }
        }
    );
}

export async function makeStreamRequest(token: any, sig: string, channelName: string) {
    return axios.get(
        `https://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8`,
        {
            params: {
                'player': 'twitchweb',
                'p': randomInteger(100000, 999999),
                'type': 'any',
                'allow_source': 'true',
                'allow_audio_only': 'true',
                'allow_spectre': 'false',
                'sig': sig,
                'token': token,
                'fast_bread': 'True'
            },
            headers: {
                'accept': '*/*',
                'accept-encoding': 'gzip, deflate',
            }
        }
    );
}

export async function fetchTwitchStream() {
    const tokenResponse = await makeAccessTokenRequest('monstercat');

    const streamResponse = await makeStreamRequest(
        tokenResponse.data.token,
        tokenResponse.data.sig,
        'monstercat'
    );

    return streamResponse;
}

export async function fetchAudioStreamUrl() {
    const streamResponse = await fetchTwitchStream();
    const streamManifest = parseStream(streamResponse);
    const audioStream = extractAudioStream(streamManifest);
    return audioStream.uri;
}
