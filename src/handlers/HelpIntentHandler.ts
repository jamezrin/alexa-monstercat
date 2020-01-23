import { HandlerInput, RequestHandler } from 'ask-sdk';

const HelpIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
    );
  },
  handle(handlerInput: HandlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    const speechText = requestAttributes.t('HELP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

export default HelpIntentHandler;
