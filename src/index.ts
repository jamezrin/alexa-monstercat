import * as Alexa from 'ask-sdk';
import { HandlerInput, ErrorHandler, RequestInterceptor, Skill } from 'ask-sdk';
import { getPersistenceAdapter } from './utils';
import sprintf from 'i18next-sprintf-postprocessor';
import i18n from 'i18next';

import {
  StartIntentHandler,
  PauseIntentHandler,
  ResumeIntentHandler,
  NonRelevantIntentHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
} from './handlers';

const languageStrings = {
  en: require('./languages/english'),
  es: require('./languages/spanish'),
};

const ErrorHandler: ErrorHandler = {
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

const LocalizationInterceptor: RequestInterceptor = {
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

let skill: Skill;

exports.handler = async function(event, context) {
  console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        StartIntentHandler,
        ResumeIntentHandler,
        PauseIntentHandler,
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
