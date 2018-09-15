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

describe('when logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a[href="/blogs/new"]');
  });

  test('can see blog create form', async () => {
    const labelText = await page.getContentsOf('form label:first-child');
    expect(labelText).toEqual('Blog Title');
  });

  describe('and using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My Title');
      await page.type('.content input', 'My Content');
      await page.click('form button');
    });

    test('submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });

    test('submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const titleText = await page.getContentsOf('.card-title');
      const contentText = await page.getContentsOf('p');
      expect(titleText).toEqual('My Title');
      expect(contentText).toEqual('My Content');
    });
  });

  describe('and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('the form shows an error message', async () => {
      const [titleError, contentError] = await Promise.all([
        page.getContentsOf('.title .red-text'),
        page.getContentsOf('.content .red-text'),
      ]);
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('when not logged in', async () => {
  const actions = [
    { method: 'get', path: '/api/blogs' },
    { method: 'post', path: '/api/blogs', data: { title: 'T', content: 'C' } },
  ];

  test('blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions);
    results.forEach(({ error }) => {
      expect(error).toEqual('You must log in!');
    });
  });
});
