import * as Alexa from 'ask-sdk';
import { HandlerInput, Skill } from 'ask-sdk';
import * as Adapter from 'ask-sdk-dynamodb-persistence-adapter';
import i18n from 'i18next';
import sprintf from 'i18next-sprintf-postprocessor';
import { fetchAudioStreamUrl } from './provider';

const languageStrings = {
  en: require('./languages/english'),
  es: require('./languages/spanish'),
};

const StartIntentHandler = {
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

      // Start playing the stream
      const result = Alexa.ResponseFactory.init();

      result.addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, streamUrl, 0);

      result.speak(speechText);
      result.withSimpleCard(requestAttributes.t('SKILL_NAME'), speechText);

      return result.getResponse();
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

const HelpIntentHandler = {
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

const PauseIntentHandler = {
  canHandle(handlerInput: HandlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent'
    );
  },
  handle(handlerInput: HandlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .withShouldEndSession(false)
      .getResponse();
  },
};

const ResumeIntentHandler = {
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

    const result = Alexa.ResponseFactory.init();

    result.addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, streamUrl, 0);

    result.withSimpleCard(requestAttributes.t('SKILL_NAME'), requestAttributes.t('WELCOME_MESSAGE'));

    return result.getResponse();
  },
};

const CancelAndStopIntentHandler = {
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

const SessionEndedRequestHandler = {
  canHandle(handlerInput: HandlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  async handle(handlerInput: HandlerInput) {
    console.log(`Session ended: ${handlerInput}`);
    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();
    // Delete current entry in the database
    await attributesManager.deletePersistentAttributes();
    return handlerInput.responseBuilder.getResponse();
  },
};

const NonRelevantIntentHandler = {
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

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput: HandlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(`Error stack: ${error.stack}`);

    const { attributesManager } = handlerInput;
    const requestAttributes = attributesManager.getRequestAttributes();

    const speechText = requestAttributes.t('ERROR_MESSAGE');

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const LocalizationInterceptor = {
  process(handlerInput: HandlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: Alexa.getLocale(handlerInput.requestEnvelope),
      fallbackLng: 'en',
      resources: languageStrings,
    });
    localizationClient['localize'] = function localize() {
      const args = arguments;
      const values = [];
      for (let i = 1; i < args.length; i += 1) {
        values.push(args[i]);
      }

      const value = i18n.t(args[0], {
        returnObjects: true,
        postProcess: 'sprintf',
        sprintf: values,
      });
      if (Array.isArray(value)) {
        return value[Math.floor(Math.random() * value.length)];
      }
      return value;
    };
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
      return localizationClient['localize'](...args);
    };
  },
};

function getPersistenceAdapter(tableName) {
  return new Adapter.DynamoDbPersistenceAdapter({
    tableName: tableName,
    createTable: true,
  });
}

let skill: Skill;

exports.handler = async function(event, context) {
  console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        StartIntentHandler,
        PauseIntentHandler,
        ResumeIntentHandler,
        NonRelevantIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
      )
      .withPersistenceAdapter(getPersistenceAdapter('alexa-monstercat'))
      .addRequestInterceptors(LocalizationInterceptor)
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

  return response;
};
