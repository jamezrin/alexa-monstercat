import { HandlerInput, RequestHandler } from 'ask-sdk';
import { fetchAudioStreamUrl } from '../provider';

const PlaybackFailedHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'AudioPlayer.PlaybackFailed';
  },

  async handle(handlerInput: HandlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;
    const persistentAttributes = (await attributesManager.getPersistentAttributes()) || {};

    const streamUrl = await fetchAudioStreamUrl();
    persistentAttributes.cachedStreamUrl = streamUrl;
    persistentAttributes.cachedStreamTimestamp = requestEnvelope.request.timestamp;
    attributesManager.setPersistentAttributes(persistentAttributes);
    await attributesManager.savePersistentAttributes();

    return handlerInput.responseBuilder.withShouldEndSession(true).getResponse();
  },
};

export default PlaybackFailedHandler;
