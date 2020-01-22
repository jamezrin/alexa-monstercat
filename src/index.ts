import * as Alexa from 'ask-sdk-core';
import i18n from 'i18next';
import sprintf from 'i18next-sprintf-postprocessor';

const languageStrings = {
    'en': require('./languages/english'),
    'es': require('./languages/spanish')
}

const StartIntentHandler = {
    canHandle(handlerInput) {
        return (handlerInput.requestEnvelope.request.type === 'LaunchRequest'
            || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
                && handlerInput.requestEnvelope.request.intent.name === 'StartStreamIntent'));
    },

    async handle(handlerInput) {
        const { attributesManager, requestEnvelope } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        if (handlerInput.requestEnvelope.context.System.device.supportedInterfaces['AudioPlayer']) {
            const speechText = requestAttributes.t('WELCOME_MESSAGE');
            const streamUrl = '';

            const result = Alexa.ResponseFactory.init();

            result.addAudioPlayerPlayDirective('REPLACE_ALL',
                streamUrl,
                streamUrl,
                0,
            );

            result.withShouldEndSession(true);
            result.speak(speechText);
            result.withSimpleCard(
                requestAttributes.t('SKILL_NAME'),
                speechText
            );

            return result.getResponse();
        } else {
            const speechText = requestAttributes.t('UNSUPPORTED_DEVICE');

            return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard(
                    requestAttributes.t('SKILL_NAME'),
                    speechText)
                .withShouldEndSession(true)
                .getResponse();
        }
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const speechText = requestAttributes.t('HELP_MESSAGE');

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard(
                requestAttributes.t('SKILL_NAME'),
                speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const speechText = requestAttributes.t('EXIT_MESSAGE');

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard(
                requestAttributes.t('SKILL_NAME'),
                speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        //any cleanup logic goes here
        console.log(`Session ended: ${handlerInput}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);
        console.log(`Error stack: ${error.stack}`);

        const { attributesManager } = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();

        const speechText = requestAttributes.t('ERROR_MESSAGE')

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    },
};

const LocalizationInterceptor = {
    process(handlerInput) {
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

let skill;

exports.handler = async function (event, context) {
    console.log(`SKILL REQUEST ${JSON.stringify(event)}`);

    if (!skill) {
        skill = Alexa.SkillBuilders.custom()
            .addRequestHandlers(
                StartIntentHandler,
                HelpIntentHandler,
                CancelAndStopIntentHandler,
                SessionEndedRequestHandler,
            )
            .addRequestInterceptors(LocalizationInterceptor)
            .addErrorHandlers(ErrorHandler)
            .create();
    }

    const response = await skill.invoke(event, context);
    console.log(`SKILL RESPONSE ${JSON.stringify(response)}`);

    return response;
};
