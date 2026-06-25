/**
 * Chat graph — Reactive chat flow using LangGraph.
 *
 * Flow:
 * 1. interpretIntent — Classify user intent
 * 2. fetchItems — Get relevant catalog items (if needed)
 * 3. rankItems — Sort by relevance (if items found)
 * 4. formatResponse — Generate final response with components
 */

import { Annotation, StateGraph, END } from '@langchain/langgraph';
import type { ChatState, ChatIntent, CatalogItem, ComponentReference, ChildContext } from '../types.js';
import { interpretIntent } from '../nodes/interpret-intent.js';
import { fetchItems } from '../nodes/fetch-items.js';
import { rankItems } from '../nodes/rank-items.js';
import { formatResponse } from '../nodes/format-response.js';

const ChatStateAnnotation = Annotation.Root({
  message: Annotation<string>,
  child_context: Annotation<ChildContext>,
  intent: Annotation<ChatIntent>,
  items: Annotation<CatalogItem[]>,
  response: Annotation<string>,
  components: Annotation<ComponentReference[]>,
  error: Annotation<string>,
});

function shouldFetchItems(state: typeof ChatStateAnnotation.State): string {
  if (
    state.intent === 'search_items' ||
    state.intent === 'ask_recommendation'
  ) {
    return 'fetch_items';
  }

  return 'format_response';
}

function shouldRankItems(state: typeof ChatStateAnnotation.State): string {
  if (state.items && state.items.length > 0) {
    return 'rank_items';
  }

  return 'format_response';
}

const graph = new StateGraph(ChatStateAnnotation)
  .addNode('interpret_intent', interpretIntent)
  .addNode('fetch_items', fetchItems)
  .addNode('rank_items', rankItems)
  .addNode('format_response', formatResponse)
  .addConditionalEdges('interpret_intent', shouldFetchItems, ['fetch_items', 'format_response'])
  .addConditionalEdges('fetch_items', shouldRankItems, ['rank_items', 'format_response'])
  .addEdge('rank_items', 'format_response')
  .addEdge('format_response', END)
  .setEntryPoint('interpret_intent')
  .compile();

export async function chatGraph(input: {
  message: string;
  child_context: ChatState['child_context'];
}): Promise<ChatState> {
  return graph.invoke({
    message: input.message,
    child_context: input.child_context,
  }) as Promise<ChatState>;
}
