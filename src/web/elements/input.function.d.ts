import CreateElement from './create-element.interface';
interface HTMLInputAttributes {
    minlength?: number;
    maxlength?: number;
}
type CreateInputElement = CreateElement<HTMLInputElement> extends (...args: infer U) => infer R ? (type: HTMLInputElement['type'], attributes?: HTMLInputAttributes, ...args: U) => R : never;
declare const input: CreateInputElement;
export default input;
//# sourceMappingURL=input.function.d.ts.map