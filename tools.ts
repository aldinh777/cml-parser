import { CMLTree } from './index';

export function toXML(tree: CMLTree): string {
    return tree
        .map((item) => {
            if (typeof item === 'string') {
                return item;
            }
            const { tag, props, children } = item;
            const proplist = Object.entries(props)
                .map(([key, value]) => ` ${key}="${value}"`)
                .join('');
            if (children.length) {
                return `<${tag}${proplist}>${toXML(children)}</${tag}>`;
            } else {
                return `<${tag}${proplist}/>`;
            }
        })
        .join('');
}
