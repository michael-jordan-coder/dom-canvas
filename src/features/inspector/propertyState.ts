import { inspectorStyleValue } from "./styleValue.ts";

export type PropertySample = { authored: string; computed: string; available?: boolean; resettable?: boolean };
export type PropertyState = {
  value: string;
  computed: string;
  authored: string;
  mixed: boolean;
  bound: boolean;
  available: boolean;
  supported: number;
  total: number;
  canReset: boolean;
};

/** Shared state for DOM declarations and frame metadata; Mixed is never a value. */
export function propertyState(samples: PropertySample[]): PropertyState {
  const supported = samples.filter(sample => sample.available !== false);
  const values = supported.map(sample => inspectorStyleValue(sample.authored, sample.computed).trim());
  const same = (list: string[]) => list.length > 0 && list.every(value => value === list[0]);
  const resolved = supported.map(sample => sample.computed);
  const mixed = values.length > 1 && (!same(values) || !same(resolved));
  return {
    value: !mixed && same(values) ? values[0] : "",
    computed: same(supported.map(sample => sample.computed)) ? supported[0].computed : "",
    authored: same(supported.map(sample => sample.authored)) ? supported[0].authored : "",
    mixed,
    bound: supported.some(sample => /var\(/i.test(sample.authored)),
    available: supported.length > 0,
    supported: supported.length,
    total: samples.length,
    canReset: supported.some(sample => sample.resettable ?? sample.authored !== ""),
  };
}

export function cssPropertyState(elements: (HTMLElement | SVGElement)[], property: string): PropertyState {
  return propertyState(elements.map(element => ({
    authored: element.style.getPropertyValue(property) || (element instanceof SVGElement && property !== "transform" ? element.getAttribute(property) ?? "" : ""),
    computed: getComputedStyle(element).getPropertyValue(property),
    available: element.isConnected,
    resettable: element.style.getPropertyValue(property) !== "",
  })));
}

export function cornerRadiusState(element: HTMLElement | SVGElement) {
  const computed = getComputedStyle(element);
  return propertyState(["top-left", "top-right", "bottom-left", "bottom-right"].map(corner => ({
    authored: element.style.getPropertyValue(`border-${corner}-radius`),
    computed: computed.getPropertyValue(`border-${corner}-radius`),
  })));
}
