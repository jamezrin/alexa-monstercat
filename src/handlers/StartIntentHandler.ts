import { HandlerInput, RequestHandler } from 'ask-sdk';
import { fetchAudioStreamUrl } from '../provider';

const StartIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'LaunchRequest' ||
      (request.type === 'IntentRequest' &&
        (request.intent.name === 'StartStreamIntent' ||
          request.intent.name === 'AMAZON.StartOverIntent' ||
          request.intent.name === 'AMAZON.RepeatIntent'))
    );
  },

  async handle(handlerInput: HandlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    if (requestEnvelope.context.System.device.supportedInterfaces['AudioPlayer']) {
      const speechText = requestAttributes.t('WELCOME_MESSAGE');
      const streamUrl = await fetchAudioStreamUrl();

      // Store the stream url for pausing/resuming without requesting again
      const persistentAttributes = (await attributesManager.getPersistentAttributes()) || {};
      persistentAttributes.cachedStreamUrl = streamUrl;
      persistentAttributes.cachedStreamTimestamp = requestEnvelope.request.timestamp;
      attributesManager.setPersistentAttributes(persistentAttributes);
      await attributesManager.savePersistentAttributes();

      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
        .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, streamUrl, 0)
        .getResponse();
    } else {
      const speechText = requestAttributes.t('UNSUPPORTED_DEVICE');
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};

export default StartIntentHandler;
