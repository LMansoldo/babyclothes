/**
 * Growth graph — Proactive growth analysis flow.
 *
 * Flow:
 * 1. analyzeCurve — Analyze measurement trends
 * 2. predictSize — Predict when next size needed
 * 3. checkThreshold — Determine if notification needed
 * 4. emitNotification — Send notification if threshold met
 */

import { Annotation, StateGraph, END } from '@langchain/langgraph';
import type { GrowthState, ChildContext, Measurement, GrowthTrend, SizePrediction, NotificationPayload } from '../types.js';
import { analyzeCurve } from '../nodes/analyze-curve.js';
import { predictSize } from '../nodes/predict-size.js';
import { checkThreshold } from '../nodes/check-threshold.js';
import { emitNotification } from '../nodes/emit-notification.js';

const GrowthStateAnnotation = Annotation.Root({
  child: Annotation<ChildContext>,
  measurements: Annotation<Measurement[]>,
  trend: Annotation<GrowthTrend>,
  prediction: Annotation<SizePrediction>,
  should_notify: Annotation<boolean>,
  notification: Annotation<NotificationPayload>,
});

function shouldNotify(state: typeof GrowthStateAnnotation.State): string {
  if (state.should_notify) {
    return 'emit_notification';
  }

  return END;
}

const graph = new StateGraph(GrowthStateAnnotation)
  .addNode('analyze_curve', analyzeCurve)
  .addNode('predict_size', predictSize)
  .addNode('check_threshold', checkThreshold)
  .addNode('emit_notification', emitNotification)
  .addEdge('analyze_curve', 'predict_size')
  .addEdge('predict_size', 'check_threshold')
  .addConditionalEdges('check_threshold', shouldNotify, ['emit_notification', END])
  .addEdge('emit_notification', END)
  .setEntryPoint('analyze_curve')
  .compile();

export async function growthGraph(input: {
  child: GrowthState['child'];
  measurements: GrowthState['measurements'];
}): Promise<GrowthState> {
  return graph.invoke({
    child: input.child,
    measurements: input.measurements,
    should_notify: false,
  }) as Promise<GrowthState>;
}
