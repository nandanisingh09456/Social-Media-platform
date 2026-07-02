const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const users = [
  { id: 1, username: 'alice', name: 'Alice Chen', avatar: 'https://i.pravatar.cc/150?img=47', bio: 'Product designer • coffee lover', followers: 1240, following: 320, isFollowing: false },
  { id: 2, username: 'bob', name: 'Bob Rivera', avatar: 'https://i.pravatar.cc/150?img=12', bio: 'Frontend engineer • building cool stuff', followers: 980, following: 210, isFollowing: true },
  { id: 3, username: 'maria', name: 'Maria Lopez', avatar: 'https://i.pravatar.cc/150?img=32', bio: 'Travel photographer', followers: 560, following: 180, isFollowing: false },
];

const posts = [
  {
    id: 101,
    content: 'Launching a new social experience with a beautiful, responsive layout. What do you think?',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
    createdAt: '2026-07-02T08:30:00Z',
    author: users[0],
    likes: [2],
    comments: [{ id: 1, user: users[1], text: 'Looks amazing!' }],
  },
  {
    id: 102,
    content: 'Designing a compact feed for creators and communities.',
    image: '',
    createdAt: '2026-07-02T06:15:00Z',
    author: users[1],
    likes: [1, 3],
    comments: [{ id: 2, user: users[2], text: 'Love the vibes.' }],
  },
];

app.use((req, _res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return next();
  }

  let rawBody = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => {
    rawBody += chunk;
  });
  req.on('end', () => {
    try {
      req.body = rawBody ? JSON.parse(rawBody) : {};
    } catch (_error) {
      req.body = {};
    }
    next();
  });
});

app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

function serializePost(post) {
  return {
    id: post.id,
    content: post.content,
    image: post.image,
    createdAt: post.createdAt,
    author: post.author,
    likes: post.likes,
    comments: post.comments,
    likedByMe: post.likes.includes(1),
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Backend is running' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'alice' && password === 'password') {
    return res.json({ token: 'token-alice', user: users[0] });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== 'token-alice') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.json({ user: users[0] });
});

app.get('/api/users', (_req, res) => {
  res.json(users);
});

app.get('/api/posts', (_req, res) => {
  res.json(posts.map(serializePost));
});

app.post('/api/posts', (req, res) => {
  const { content, image } = req.body || {};
  const newPost = {
    id: Date.now(),
    content: content || '',
    image: image || '',
    createdAt: new Date().toISOString(),
    author: users[0],
    likes: [],
    comments: [],
  };
  posts.unshift(newPost);
  res.status(201).json(serializePost(newPost));
});

app.post('/api/posts/:postId/like', (req, res) => {
  const post = posts.find((entry) => entry.id === Number(req.params.postId));
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (post.likes.includes(1)) {
    post.likes = post.likes.filter((userId) => userId !== 1);
  } else {
    post.likes.push(1);
  }
  return res.json(serializePost(post));
});

app.post('/api/posts/:postId/comment', (req, res) => {
  const post = posts.find((entry) => entry.id === Number(req.params.postId));
  const text = (req.body?.text || '').trim();
  if (!post) return res.status(404).json({ error: 'Post not found' });
  if (!text) return res.status(400).json({ error: 'Comment text is required' });
  post.comments.push({ id: Date.now(), user: users[0], text });
  return res.json(serializePost(post));
});

app.post('/api/follow/:userId', (req, res) => {
  const targetUser = users.find((entry) => entry.id === Number(req.params.userId));
  if (!targetUser) return res.status(404).json({ error: 'User not found' });
  targetUser.isFollowing = !targetUser.isFollowing;
  targetUser.followers += targetUser.isFollowing ? 1 : -1;
  return res.json({ currentUser: users[0], targetUser });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
