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
    let tagFlag: boolean = false;
    let propFindFlag: boolean = false;
    let propFlag: boolean = false;
    let valueFlag: boolean = false;
    let propsStack: PropertyPair[] = [];
    for (let i = text.length - 1; i >= 0; i--) {
        const ch = text[i];
        if (valueFlag) {
            if (ch === '"') {
                valueFlag = false;
            } else {
                value.unshift(ch);
            }
            continue;
        } else {
            if (ch === '"') {
                valueFlag = true;
                continue;
            }
        }
        if (propFindFlag) {
            if (propFlag) {
                if (ch.match(/\s/)) {
                    propsStack.unshift({
                        prop: propname.join(''),
                        val: value.join('')
                    });
                    propname = [];
                    value = [];
                    propFindFlag = false;
                    propFlag = false;
                } else {
                    propname.unshift(ch);
                }
            } else {
                if (!ch.match(/\s/)) {
                    propFlag = true;
                    propname.unshift(ch);
                }
            }
            continue;
        } else {
            if (ch === '=') {
                propFindFlag = true;
                continue;
            }
        }
        if (tagFlag) {
            if (ch.match(/\s/)) {
                for (const { prop, val } of propsStack) {
                    props[prop] = val;
                }
                return {
                    tag: tag.join(''),
                    props: props,
                    previousText: text.substring(0, i + 1)
                };
            } else {
                tag.unshift(ch);
            }
            continue;
        } else {
            if (!ch.match(/\s/)) {
                tagFlag = true;
                tag.unshift(ch);
            }
        }
    }
    for (const { prop, val } of propsStack) {
        props[prop] = val;
    }
    return { tag: tag.join(''), props, previousText: '' };
}

export function parseCML(text: string, trim: boolean=false): CMLTree {
    const result: CMLTree = [];
    const parentalStack: CMLObject[] = [];
    let stream: string = '';
    let escapeMode: boolean = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (escapeMode) {
            if (ch === '<' || ch === '>') {
                stream += ch;
            } else {
                stream += '\\' + ch;
            }
            escapeMode = false;
            continue;
        }
        if (ch === '\\') {
            escapeMode = true;
            continue;
        }
        if (ch === '<') {
            const { tag, props, previousText } = findTag(stream);
            let parentChildren = result;
            if (parentalStack.length) {
                parentChildren = parentalStack[parentalStack.length - 1].children;
            }
            stream = '';
            if (previousText) {
                if (trim) {
                    const trimmedPrevious = previousText.trim();
                    if (trimmedPrevious) {
                        parentChildren.push(trimmedPrevious);
                    }
                } else {
                    parentChildren.push(previousText);
                }
            }
            const elem: CMLObject = { tag, props, children: [] };
            parentChildren.push(elem);
            parentalStack.push(elem);
        } else if (ch === '>') {
            const parent = parentalStack.pop();
            if (stream) {
                if (parent) {
                    if (trim) {
                        const trimmedStream = stream.trim();
                        if (trimmedStream) {
                            parent.children.push(trimmedStream);
                        }
                    } else {
                        parent.children.push(stream);
                    }
                }
                stream = '';
            }
        } else {
            stream += ch;
        }
    }
    if (stream) {
        if (trim) {
            const trimmedStream = stream.trim();
            if (trimmedStream) {
                result.push(trimmedStream);
            }    
        } else {
            result.push(stream);
        }
    }
    return result;
}

export function cmlTreeToXMLString(tree: CMLTree): string {
    let result = '';
    for (const item of tree) {
        if (typeof item === 'string') {
            result += item;
        } else {
            const { tag, props, children } = item;
            const proplist: string[] = [];
            for (const key in props) {
                const value = props[key];
                proplist.push(` ${key}="${value}"`);
            }
            if (children.length) {
                result += `<${tag}${proplist.join('')}>${cmlTreeToXMLString(children)}</${tag}>`;
            } else {
                result += `<${tag}${proplist.join('')}/>`;
            }
        }
    }
    return result;
}
