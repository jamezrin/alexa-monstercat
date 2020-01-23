import { HandlerInput, RequestHandler } from 'ask-sdk';

const CancelAndStopIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
    );
  },
  async handle(handlerInput: HandlerInput) {
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    // Delete current entry in the database
    console.log(`Deleting cached stream: ${JSON.stringify(handlerInput)}`);
    await attributesManager.deletePersistentAttributes();

    const speechText = requestAttributes.t('EXIT_MESSAGE');
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText)
      .addAudioPlayerStopDirective()
      .withShouldEndSession(true)
      .getResponse();
  },
};

export default CancelAndStopIntentHandler;
