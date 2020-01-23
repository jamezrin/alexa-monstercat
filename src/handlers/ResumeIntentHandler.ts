import { HandlerInput, RequestHandler } from 'ask-sdk';
import { fetchAudioStreamUrl } from '../provider';

const ResumeIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent'
    );
  },
  async handle(handlerInput: HandlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const persistentAttributes = (await attributesManager.getPersistentAttributes()) || {};
    const streamUrl = persistentAttributes.cachedStreamUrl;

    if (!streamUrl) {
      const speechText = requestAttributes.t('NOT_PLAYING_MESSAGE');
      return handlerInput.responseBuilder
        .speak(speechText)
        .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
        .getResponse();
    }

    return handlerInput.responseBuilder
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), requestAttributes.t('WELCOME_MESSAGE'))
      .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, streamUrl, 0)
      .getResponse();
  },
};

export default ResumeIntentHandler;
