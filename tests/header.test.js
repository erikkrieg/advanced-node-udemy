const Page = require('./helpers/Page');
const { DOMAIN } = require('./config');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto(DOMAIN);
});

afterEach(async () => {
  await page.close();
});

test('the header has the correct text', async () => {
  const text = await page.getContentsOf('.brand-logo');
  expect(text).toEqual('Blogster');
});

test('clicking login launches the Google login flow', async () => {
  const loginLinkSelector = 'a[href="/auth/google"]';
  await page.click(loginLinkSelector);

  const url = await page.url();
  expect(url).toMatch(/accounts\.google\.com/);
});

test('when signed in, shows logout button', async () => {
  await page.login();
  const buttonSelector = 'a[href="/auth/logout"]';  
  const buttonText = await page.getContentsOf(buttonSelector);
  expect(buttonText).toEqual('Logout');
});