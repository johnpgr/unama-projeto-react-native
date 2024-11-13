import { ReadableStream, TransformStream } from "web-streams-polyfill"

import "@azure/core-asynciterator-polyfill"

import { RNEventSource } from "rn-eventsource-reborn"

import "expo-router/entry"

globalThis.ReadableStream = globalThis.ReadableStream || ReadableStream
globalThis.TransformStream = globalThis.TransformStream || TransformStream
