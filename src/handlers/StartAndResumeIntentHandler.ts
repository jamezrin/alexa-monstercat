import { HandlerInput, RequestHandler } from 'ask-sdk';
import { fetchAudioStreamUrl } from '../provider';
import { checkStreamTimeValid } from '../utils';

const StartAndResumeIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'LaunchRequest' ||
      (request.type === 'IntentRequest' &&
        (request.intent.name === 'StartStreamIntent' ||
          request.intent.name === 'AMAZON.StartOverIntent' ||
          request.intent.name === 'AMAZON.RepeatIntent' ||
          request.intent.name === 'AMAZON.ResumeIntent'))
    );
  },

  async handle(handlerInput: HandlerInput) {
    const { attributesManager, requestEnvelope } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    if (requestEnvelope.context.System.device.supportedInterfaces['AudioPlayer']) {
      const persistentAttributes = (await attributesManager.getPersistentAttributes()) || {};
      const cachedStreamUrl = persistentAttributes.cachedStreamUrl;
      const cachedStreamTimestamp = persistentAttributes.cachedStreamTimestamp;
      const requestTimestamp = requestEnvelope.request.timestamp;

      if (cachedStreamUrl && checkStreamTimeValid(cachedStreamTimestamp, requestTimestamp)) {
        console.log(`Started playing cached stream: ${JSON.stringify(handlerInput)}`);
        const speechText = requestAttributes.t('WELCOME_BACK_MESSAGE');

        const responseBuilder = handlerInput.responseBuilder
          .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
          .addAudioPlayerPlayDirective('REPLACE_ALL', cachedStreamUrl, cachedStreamUrl, 0)
          .withShouldEndSession(true);

        if (
          requestEnvelope.request.type === 'LaunchRequest' ||
          (requestEnvelope.request.type === 'IntentRequest' &&
            requestEnvelope.request.intent.name !== 'AMAZON.ResumeIntent')
        ) {
          responseBuilder.speak(speechText);
        }

        return responseBuilder.getResponse();
      }

      console.log(`Started playing fetching a new stream: ${JSON.stringify(handlerInput)}`);
      const streamUrl = await fetchAudioStreamUrl();
      persistentAttributes.cachedStreamUrl = streamUrl;
      persistentAttributes.cachedStreamTimestamp = requestEnvelope.request.timestamp;
      attributesManager.setPersistentAttributes(persistentAttributes);
      await attributesManager.savePersistentAttributes();

      const speechText = requestAttributes.t('WELCOME_MESSAGE');
      const responseBuilder = handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
        .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, streamUrl, 0)
        .withShouldEndSession(true);
      return responseBuilder.getResponse();
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

export default StartAndResumeIntentHandler;
