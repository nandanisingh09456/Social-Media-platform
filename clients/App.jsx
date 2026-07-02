import { useEffect, useMemo, useState } from 'react';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import Navbar from './pages/Navbar';
import ProfilePage from './pages/ProfilePage';

const API_BASE = '/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('social-token') || '');
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loginForm, setLoginForm] = useState({ username: 'alice', password: 'password' });
  const [commentDrafts, setCommentDrafts] = useState({});
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState('');

  const authHeaders = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  async function fetchJson(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...(options.headers || {})
      },
      ...options
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error('The server returned an invalid response.');
    }
    if (!response.ok) throw new Error(data?.error || 'Request failed');
    return data;
  }

  async function loadData() {
    if (!token) return;
    try {
      const [me, allUsers, allPosts] = await Promise.all([
        fetchJson('/me'),
        fetchJson('/users'),
        fetchJson('/posts')
      ]);
      setUser(me.user);
      setUsers(allUsers);
      setPosts(allPosts);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    try {
      const result = await fetchJson('/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      if (!result.token) throw new Error(result.error || 'Login failed');
      localStorage.setItem('social-token', result.token);
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleFollow(targetId) {
    try {
      const result = await fetchJson(`/follow/${targetId}`, { method: 'POST' });
      setUser(result.currentUser);
      setUsers((current) => current.map((entry) => entry.id === result.targetUser.id ? { ...entry, ...result.targetUser } : entry));
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleLike(postId) {
    try {
      const updatedPost = await fetchJson(`/posts/${postId}/like`, { method: 'POST' });
      setPosts((current) => current.map((post) => post.id === updatedPost.id ? updatedPost : post));
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitComment(postId) {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    try {
      const updatedPost = await fetchJson(`/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ text })
      });
      setPosts((current) => current.map((post) => post.id === updatedPost.id ? updatedPost : post));
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function createPost(event) {
    event.preventDefault();
    const text = postText.trim();
    if (!text && postImages.length === 0) return;

    try {
      const imageUrls = postImages.map((file) => URL.createObjectURL(file));
      const newPost = {
        id: Date.now(),
        userId: user.id,
        content: text,
        image: imageUrls[0] || '',
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
        author: user,
        likedByMe: false
      };
      setPosts((current) => [newPost, ...current]);
      setPostText('');
      setPostImages([]);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleImageSelection(event) {
    const files = Array.from(event.target.files || []);
    setPostImages((current) => [...current, ...files].slice(0, 4));
  }

  function logout() {
    localStorage.removeItem('social-token');
    setToken('');
    setUser(null);
    setPosts([]);
    setUsers([]);
  }

  if (!token || !user) {
    return (
      <LoginPage
        loginForm={loginForm}
        onChange={(field, value) => setLoginForm({ ...loginForm, [field]: value })}
        onSubmit={handleLogin}
        error={error}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="main-layout">
        <Navbar user={user} activeView={activeView} onNavigate={setActiveView} onLogout={logout} />

        <main className="content-area">
          {activeView === 'profile' ? (
            <ProfilePage user={user} users={users} posts={posts} onOpenImage={setSelectedImage} />
          ) : activeView === 'saved' ? (
            <section className="saved-page card">
              <h2>Saved Posts</h2>
              <p>Your saved posts will appear here.</p>
            </section>
          ) : (
            <FeedPage
              posts={posts}
              postText={postText}
              postImages={postImages}
              commentDrafts={commentDrafts}
              onPostTextChange={(event) => setPostText(event.target.value)}
              onAddImages={handleImageSelection}
              onCreatePost={createPost}
              onClearComposer={() => { setPostText(''); setPostImages([]); }}
              onToggleLike={toggleLike}
              onSubmitComment={submitComment}
              onCommentDraftChange={(postId, value) => setCommentDrafts({ ...commentDrafts, [postId]: value })}
              onOpenImage={setSelectedImage}
            />
          )}

        </main>
      </div>

      {selectedImage ? (
        <div className="image-modal" onClick={() => setSelectedImage(null)}>
          <button className="modal-close" onClick={() => setSelectedImage(null)} aria-label="Close image">×</button>
          <img src={selectedImage} alt="Full view" onClick={(event) => event.stopPropagation()} />
        </div>
      ) : null}
    </div>
  );
}

export default App;
