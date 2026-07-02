import React from 'react';

function ProfilePage({ user, users, posts, onOpenImage }) {
  const userPosts = posts.filter((post) => post.author?.id === user?.id || post.author?.username === user?.username);

  return (
    <section className="profile-page">
      <div className="card profile-hero">
        <img className="profile-avatar" src={user?.avatar || 'https://i.pravatar.cc/150'} alt={user?.name || 'profile'} />
        <div>
          <h2>{user?.name || 'Your Profile'}</h2>
          <p>@{user?.username || 'user'}</p>
          <p>{user?.bio || 'Your story goes here.'}</p>
        </div>
      </div>

      <div className="card people-card">
        <h3>Suggested People</h3>
        <div className="people-list">
          {users.filter((entry) => entry.id !== user?.id).map((entry) => (
            <div key={entry.id} className="people-item">
              <div>
                <strong>{entry.name}</strong>
                <p>@{entry.username}</p>
              </div>
              <button type="button" className="ghost-button">Follow</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card posts-card">
        <h3>Your Posts</h3>
        <div className="posts-stack">
          {userPosts.map((post) => (
            <article key={post.id} className="post-card compact">
              <p>{post.content}</p>
              {post.image ? <img src={post.image} alt="profile post" onClick={() => onOpenImage(post.image)} /> : null}
            </article>
          ))}
          {userPosts.length === 0 ? <p>No posts yet.</p> : null}
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
