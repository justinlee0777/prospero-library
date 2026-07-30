export default function setARIA(element, ariaConfig) {
  ariaConfig?.label && (element.ariaLabel = ariaConfig.label);
}
