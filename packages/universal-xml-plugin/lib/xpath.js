import {select as xpathQuery} from 'xpath';
import {DOMParser} from '@xmldom/xmldom';

/**
 *
 * @param {string} query
 * @param {string} xmlStr
 * @returns {NodeSelectedValue[]}
 */
export function runQuery(query, xmlStr) {
  const dom = new DOMParser().parseFromString(xmlStr);
  const nodes = xpathQuery(query, dom);
  return nodes;
}

/**
 *
 * @param {string} query
 * @param {string} xmlStr
 * @param {boolean} multiple
 * @returns {string | null}
 */
export function transformQuery(query, xmlStr, multiple) {
  const nodes = runQuery(query, xmlStr);

  const newQueries = nodes.map((node) => {
    const indexPath = getNodeAttrVal(node, 'indexPath');
    // at this point indexPath will look like /0/0/1/1/0/1/0/2
    let newQuery = indexPath
      .substring(1) // remove leading / so we can split
      .split('/') // split into idnexes
      .map((indexStr) => {
        // map to xpath node indexes (1-based)
        const xpathIndex = parseInt(indexStr, 10) + 1;
        return `*[${xpathIndex}]`;
      })
      .join('/'); // reapply /

    // now to make this a valid xpath from the root, prepend the / we removed earlier
    return `/${newQuery}`;
  });

  let newSelector = null;
  if (newQueries.length) {
    if (multiple) {
      newSelector = newQueries.join(' | ');
    } else {
      newSelector = newQueries[0];
    }
  }
  return newSelector;
}

/**
 *
 * @param {NodeWithAttribute} node
 * @param {string} attr
 * @returns {string} - The value of the attribute.
 * @throws {Error} - If the node does not have the attribute.
 */
export function getNodeAttrVal(node, attr) {
  const attrObjs = Object.values(node.attributes).filter((obj) => obj.name === attr);
  if (!attrObjs.length) {
    throw new Error(`Tried to retrieve a node attribute '${attr}' but the node didn't have it`);
  }
  return attrObjs[0].value;
}

/**
 * @typedef NodeWithAttribute
 * @property {Object} attributes
 */

/**
 * @typedef {Node | Attr | string | number | boolean} NodeSelectedValue
 */
