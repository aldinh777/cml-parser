export type CMLTree = (CMLObject | string)[];

interface PropertyPair {
    prop: string;
    val: string;
}
interface TagResult {
    tag: string;
    props: Properties;
    previousText: string;
}
interface Properties {
    [key: string]: any;
}
export interface CMLObject {
    tag: string;
    props: Properties;
    children: CMLTree;
}

function findTag(text: string): TagResult {
    let tag: string[] = [];
    let propname: string[] = [];
    let value: string[] = [];
    let props: Properties = {};
    let tagFlag = false;
    let propFindFlag = false;
    let propFlag = false;
    let valueFlag = false;
    let propsStack: PropertyPair[] = [];
    for (let i = text.length - 1; i >= 0; i--) {
        const ch = text[i];
        if (valueFlag) {
            if (ch === '"') {
                valueFlag = false;
            } else {
                value.unshift(ch);
            }
        } else if (ch === '"') {
            valueFlag = true;
        } else if (propFindFlag) {
            if (propFlag) {
                if (ch.match(/\s/)) {
                    propsStack.unshift({
                        prop: propname.join(''),
                        val: value.join('')
                    });
                    [propname, value, propFindFlag, propFlag] = [[], [], false, false];
                } else {
                    propname.unshift(ch);
                }
            } else if (!ch.match(/\s/)) {
                propFlag = true;
                propname.unshift(ch);
            }
        } else if (ch === '=') {
            propFindFlag = true;
        } else if (tagFlag) {
            if (ch.match(/\s/)) {
                for (const { prop, val } of propsStack) {
                    props[prop] = val;
                }
                return { tag: tag.join(''), props, previousText: text.substring(0, i + 1) };
            } else {
                tag.unshift(ch);
            }
        } else if (!ch.match(/\s/)) {
            tagFlag = true;
            tag.unshift(ch);
        }
    }
    for (const { prop, val } of propsStack) {
        props[prop] = val;
    }
    return { tag: tag.join(''), props, previousText: '' };
}

function cleanTrim(text: string): string {
    const trimmed = text.trim();
    if (!trimmed) return trimmed;
    const leftSpace = text.startsWith(' ') ? ' ' : '';
    const rightSpace = text.endsWith(' ') ? ' ' : '';
    return leftSpace + trimmed + rightSpace;
}

export function parseCML(text: string, trim: boolean = false): CMLTree {
    const result: CMLTree = [];
    const parentalStack: CMLObject[] = [];
    let stream = '';
    let escapeMode = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (escapeMode) {
            stream += ch === '<' || ch === '>' ? ch : '/' + ch;
            escapeMode = false;
        } else if (ch === '/') {
            escapeMode = true;
        } else if (ch === '<') {
            const { tag, props, previousText } = findTag(stream);
            let parentChildren = result;
            if (parentalStack.length) {
                parentChildren = parentalStack[parentalStack.length - 1].children;
            }
            stream = '';
            if (previousText) {
                const trimmedPrevious = trim ? cleanTrim(previousText) : previousText;
                if (trimmedPrevious) {
                    parentChildren.push(trimmedPrevious);
                }
            }
            const elem: CMLObject = { tag, props, children: [] };
            parentChildren.push(elem);
            parentalStack.push(elem);
        } else if (ch === '>') {
            const parent = parentalStack.pop();
            if (stream) {
                if (parent) {
                    const trimmedStream = trim ? cleanTrim(stream) : stream;
                    if (trimmedStream) {
                        parent.children.push(trimmedStream);
                    }
                }
                stream = '';
            }
        } else {
            stream += ch;
        }
    }
    if (stream) {
        const trimmedStream = trim ? cleanTrim(stream) : stream;
        if (trimmedStream) {
            result.push(trimmedStream);
        }
    }
    return result;
}

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
