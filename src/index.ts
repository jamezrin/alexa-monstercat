import axios from 'axios';

function makeKrakenRequest(clientId, channelName) {
  return axios.get(`https://api.twitch.tv/kraken/users.json`, {
    headers: {
      'accept': 'application/vnd.twitchtv.v5+json',
      'accept-encoding': 'gzip, deflate',
      'client-id': clientId,
      'connection': 'keep-alive',
    },
    params: {
      'as3': 't',
      'login': channelName
    }
  })
}

function makeTmiRequest(clientId, hostId) {
  return axios.get(`https://tmi.twitch.tv/hosts`, {
    headers: {
      'accept': 'application/vnd.twitchtv.v5+json',
      'accept-encoding': 'gzip, deflate',
      'client-id': clientId,
      'connection': 'keep-alive',
    },
    params: {
      'as3': 't',
      'include_logins': '1',
      'host': hostId
    }
  })
}

function makeAuthRequest(clientId, clientSecret) {
  return axios.post('https://id.twitch.tv/oauth2/token', null, {
    params: {
      'client_id': clientId,
      'client_secret': clientSecret,
      'grant_type': 'client_credentials',
      'scope': 'channel_read'
    },
  })
}

function makeAccessTokenRequest(clientId, channelName) {
  return axios.get(`https://api.twitch.tv/api/channels/${channelName}/access_token.json`, {
    headers: {
      'accept': 'application/vnd.twitchtv.v5+json',
      'accept-encoding': 'gzip, deflate',
      'client-id': clientId,
      'connection': 'keep-alive',
    },
    params: {
      'as3': 't'
    }
  })
}

(async () => {
  const clientId = 'g6e4aps6ktnug6vbnrvd61xohrri6b';
  const clientSecret = 'gl2trp21buu75urdscqyrgobiopc3h'
  const channelName = 'monstercat';

  const krakenResponse = await makeKrakenRequest(clientId, channelName);
  console.log(krakenResponse.data)

  const hostId = krakenResponse.data["users"][0]["_id"];
  const tmiResponse = await makeTmiRequest(clientId, hostId)
  console.log(tmiResponse.data)

  const authResponse = await makeAuthRequest(clientId, clientSecret);
  console.log(authResponse)

  const accessTokenResponse = await makeAccessTokenRequest(clientId, channelName);
  console.log(accessTokenResponse.data)
})()
