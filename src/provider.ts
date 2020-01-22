import axios from 'axios';

const userAgent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36"
const tokenObj = {  }

function makeInitialRequest(channelName) {
    return axios.get(`https://twitch.tv/${channelName}`, {
        headers: {
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            'connection': 'keep-alive',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-site': 'none',
            'sec-fetch-user': '?1',
            'upgrade-insecure-requests': 1
        },
        httpsAgent: userAgent,
    });
}

function makeTokenRequest(clientId, channelName) {
    return axios.get(`https://api.twitch.tv/api/channels/${channelName}/access_token`, {
        headers: {
            'accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, application/json, text/plain',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-us',
            'client-id': clientId,
            'connection': 'keep-alive',
            'content-type': 'application/json; charset=UTF-8',
            'cookie': ''
        },
        params: {
            'oauth_token': 'undefined',
            'need_https': 'true',
            'platform': 'web',
            'player_type': 'site',
            'player_backend': 'mediaplayer'
        },
        httpsAgent: userAgent,
    });
}

function makeHlsRequest(tokenObj, channelName) {
    return axios.get(`https://usher.ttvnw.net/api/channel/hls/${channelName}.m3u8`, {
        headers: {
            'accept': 'application/x-mpegURL, application/vnd.apple.mpegurl, application/json, text/plain',
            'accept-encoding': 'gzip, deflate, br',
            'connection': 'keep-alive',
        },
        params: {
            'allow_audio_only': 'true',
            'allow_source': 'true',
            'fast_bread': 'true',
            'p': randomInteger(1000000, 9999999),
            'play_session_id': null,
            'player_backend': 'mediaplayer',
            'playlist_include_framerate': 'true',
            'reassignments_supported': 'true',
            'sig': null,
            'supported_codecs': 'avc1',
            'token': tokenObj,
            'cdm': 'wv'
        },
        httpsAgent: userAgent,
    })
}

function randomInteger(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

(async () => {
    const channelName = 'monstercat'

    const initialResponse = await makeInitialRequest(channelName);
    console.log(initialResponse)
})()
