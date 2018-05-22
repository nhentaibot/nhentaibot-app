require('dotenv').config();
const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const fetch = require('node-fetch');

const r = new Snoowrap({
  userAgent: 'nhentaibot-app',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  username: process.env.REDDIT_USER,
  password: process.env.REDDIT_PASS
});

const client = new Snoostorm(r);

// Configure options for stream: subreddit & results per query
const streamOpts = {
  subreddit: 'animemes',
  results: 25
};

// Create a Snoostorm CommentStream with the specified options
const comments = client.CommentStream(streamOpts);

// On comment, perform whatever logic you want to do
comments.on('comment', (comment) => {
    const NHENTAI_BASE = `https://nhentai.net`
    const NHENTAI_API_BASE = `${NHENTAI_BASE}/api/gallery/`;
    const NHENTAI_GALLERY_BASE = `${NHENTAI_BASE}/g/`;

    console.info(comment.body);

    const matches = comment.body.match(/\<[0-9]{1,6}\>/im);

    if (matches && matches.length) {
      const code = matches[0].replace('<', '').replace('>', '');

      fetch(`${NHENTAI_API_BASE}${code}`)
        .then(res => res.json())
        .then(json => {
          const {
            id,
            title: { english: title },
            tags,
            num_pages: length ,
            num_favorites: favorites,
          } = json;

          const tagsList = tags.map(({ name, url }) => `[${name}](${NHENTAI_BASE}${url})`).sort().join(', ');
          const reply =
`**[${title}](${NHENTAI_GALLERY_BASE}${id})**

___

${length} pages | Favorited ${favorites} times

___

Tags: ${tagsList}

___

This bot is in beta! Leave a comment! | To use bot: <code>
`

        comment.reply(reply);

        console.info(reply);
      });
    }
});
