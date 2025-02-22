/* eslint-disable no-case-declarations */

import _ from 'lodash';
import BasePlugin from 'appium/plugin';

const STANDARD_CAPS = [
  'browserName',
  'browserVersion',
  'platformName',
  'acceptInsecureCerts',
  'pageLoadStrategy',
  'proxy',
  'setWindowRect',
  'timeouts',
  'unhandledPromptBehavior',
];

const VENDOR_PREFIX = 'appium';
const HAS_VENDOR_PREFIX_RE = /^.+:/;

/**
 *
 * @implements {Plugin}
 */
export class RelaxedCapsPlugin extends BasePlugin {
  /**
   * @template {Constraints} C
   * @param {Capabilities<C>} caps
   * @returns {NSCapabilities<C>} - The transformed capability object.
   */
  transformCaps(caps) {
    const newCaps = {};

    // if this doesn't look like a caps object just return it
    if (!_.isPlainObject(caps)) {
      return caps;
    }

    const adjustedKeys = [];
    for (const key of Object.keys(caps)) {
      if (STANDARD_CAPS.includes(key) || HAS_VENDOR_PREFIX_RE.test(key)) {
        // if the cap is a standard one, or if it already has a vendor prefix, leave it unchanged
        newCaps[key] = caps[key];
      } else {
        // otherwise add the appium vendor prefix
        newCaps[`${VENDOR_PREFIX}:${key}`] = caps[key];
        adjustedKeys.push(key);
      }
    }
    if (adjustedKeys.length) {
      this.logger.info(
        `Adjusted keys to conform to capability prefix requirements: ` +
          JSON.stringify(adjustedKeys)
      );
    }
    return newCaps;
  }

  /**
   *
   * @param {Function} next - The function to be executed after this one.
   * @param {import('@appium/types').ExternalDriver} driver - The driver instance
   * @param {W3CCapabilities} jwpDesCaps
   * @param {W3CCapabilities} jwpReqCaps
   * @param {Capabilities} caps
   *
   */
  async createSession(next, driver, jwpDesCaps, jwpReqCaps, caps) {
    const newCaps = {};
    if (_.isArray(caps.firstMatch)) {
      newCaps.firstMatch = caps.firstMatch.map(this.transformCaps.bind(this));
    }
    if (_.isPlainObject(caps.alwaysMatch)) {
      newCaps.alwaysMatch = this.transformCaps(caps.alwaysMatch);
    }
    return await driver.createSession(jwpDesCaps, jwpReqCaps, newCaps);
  }
}

/**
 * @typedef {import('@appium/types').Capabilities} Capabilities
 */

/**
 * @typedef {import('@appium/types/lib/driver').Constraint} Constraints
 */

/**
 * @typedef {import('@appium/types/lib/driver').W3CCapabilities<C, Extra>} W3CCapabilities
 */

/**
 * @typedef {import('@appium/types').Plugin} Plugin
 */
