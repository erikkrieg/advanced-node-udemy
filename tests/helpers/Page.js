const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');
const { DOMAIN } = require('../config');

class Page {
  constructor({ browser, controller}) {
    this._browser = browser;
    this._controller = controller;
  }

  async login() {
    const buttonSelector = 'a[href="/auth/logout"]';
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);
    await Promise.all([
      this._controller.setCookie({ name: 'session', value: session }),
      this._controller.setCookie({ name: 'session.sig', value: sig }),
    ]);
    await this._controller.goto(`${DOMAIN}/blogs`);
    await this._controller.waitFor(buttonSelector);
  }

  getContentsOf(selector) {
    return this._controller.$eval(selector, el => el.innerHTML);
  }

  /** 
   * Send a GET request from the page
   * 
   * @param {object} options
   * @param {string} options.path
   */
  get(options) {
    return this._controller.evaluate(({ path }) => (
      fetch(path, {
        method: 'GET',
        credentials: 'same-origin',
      }).then(res => res.json())
    ), options);
  }

  /** 
   * Send a POST request from the page
   * 
   * @param {object} options
   * @param {string} options.path
   * @param {object|array} options.data
   */
  post(options) {
    return this._controller.evaluate(({ path, data }) => (
      fetch(path, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      }).then(res => res.json())
    ), options);
  }

  execRequests(actions) {
    return Promise.all(
      actions.map(({ method, ...options }) => this[method](options))
    );
  }

  static async build() {
    const browser = await puppeteer.launch({
      headless: true,
      // supposed to improve performance in CI
      args: ['--no-sandbox'],
    });
    const controller = await browser.newPage();
    const page = new Page({ browser, controller });
    return new Proxy(page, {
      get(target, property) {
        return (
          target[property] ||
          target._browser[property] ||
          target._controller[property]
        );
      }
    });
  }
}

module.exports = Page;
