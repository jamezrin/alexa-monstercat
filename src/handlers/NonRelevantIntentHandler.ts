import { HandlerInput, RequestHandler } from 'ask-sdk';

const NonRelevantIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'IntentRequest' &&
      (request.intent.name === 'AMAZON.LoopOffIntent' ||
        request.intent.name === 'AMAZON.LoopOnIntent' ||
        request.intent.name === 'AMAZON.NextIntent' ||
        request.intent.name === 'AMAZON.PreviousIntent' ||
        request.intent.name === 'AMAZON.ShuffleOffIntent' ||
        request.intent.name === 'AMAZON.ShuffleOnIntent')
    );
  },
  handle(handlerInput: HandlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const speechText = requestAttributes.t('UNSUPPORTED_INTENT');
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
      .getResponse();
  },
};

export default NonRelevantIntentHandler;
