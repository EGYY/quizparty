import type { ImageRequireSource } from 'react-native';

declare const require: (path: string) => ImageRequireSource;

export const soundMainTheme = require('./sounds/main-theme.mp3');
export const soundQuestionReview = require('./sounds/question-review.mp3');
export const soundReveal = require('./sounds/reveal.mp3');
export const soundFinal = require('./sounds/final.mp3');
export const soundError = require('./sounds/error.mp3');
export const soundButtonSubmit = require('./sounds/button-submit.mp3');
export const soundFocus = require('./sounds/focus.mp3');
