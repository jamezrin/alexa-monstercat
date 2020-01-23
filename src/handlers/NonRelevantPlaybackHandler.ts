import { HandlerInput, RequestHandler } from 'ask-sdk';

const NonRelevantPlaybackHandler: RequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'AudioPlayer.PlaybackStarted' ||
      request.type === 'AudioPlayer.PlaybackFinished' ||
      request.type === 'AudioPlayer.PlaybackNearlyFinished' ||
      request.type === 'AudioPlayer.PlaybackStopped'
    );
  },

  handle(handlerInput: HandlerInput) {
    return handlerInput.responseBuilder.getResponse();
  },
};

export default NonRelevantPlaybackHandler;
