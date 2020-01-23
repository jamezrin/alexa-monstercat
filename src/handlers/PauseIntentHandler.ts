import { HandlerInput, RequestHandler } from 'ask-sdk';

const PauseIntentHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
    );
  },
  // TODO: Say something
  handle(handlerInput: HandlerInput) {
    return handlerInput.responseBuilder.addAudioPlayerStopDirective().getResponse();
  },
};

export default PauseIntentHandler;
