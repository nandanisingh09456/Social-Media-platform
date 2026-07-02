import React from 'react';

function FeedPage({
  posts,
  postText,
  postImages,
  commentDrafts,
  onPostTextChange,
  onAddImages,
  onCreatePost,
  onClearComposer,
  onToggleLike,
  onSubmitComment,
  onCommentDraftChange,
  onOpenImage,
}) {
  return (
    <section className="feed-page">
      <div className="card composer">
        <div className="composer-header">
          <h2>Create Post</h2>
          <button type="button" className="ghost-button" onClick={onClearComposer}>Clear</button>
        </div>
        <form onSubmit={onCreatePost}>
          <textarea
            value={postText}
            onChange={onPostTextChange}
            placeholder="What is happening today?"
            rows={4}
          />
          <div className="composer-actions">
            <label className="upload-pill">
              <input type="file" accept="image/*" multiple onChange={onAddImages} />
              Add Photos
            </label>
            <button type="submit" className="primary-button">Post</button>
          </div>
          {postImages.length > 0 ? (
            <div className="image-preview-row">
              {postImages.map((file, index) => (
                <div key={`${file.name}-${index}`} className="image-preview">
                  <img src={URL.createObjectURL(file)} alt="preview" />
                </div>
              ))}
            </div>
          ) : null}
        </form>
      </div>

      <div className="posts-stack">
        {posts.map((post) => (
          <article className="card post-card" key={post.id}>
            <div className="post-header">
              <div className="avatar-stack">
                <img src={post.author?.avatar || 'https://i.pravatar.cc/150'} alt={post.author?.name || 'user'} />
                <div>
                  <h3>{post.author?.name || 'Unknown user'}</h3>
                  <p>@{post.author?.username || 'user'} • {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <p className="post-content">{post.content}</p>
            {post.image ? <img className="post-image" src={post.image} alt="post" onClick={() => onOpenImage(post.image)} /> : null}

            <div className="post-actions">
              <button type="button" className={`action-button ${post.likedByMe ? 'active' : ''}`} onClick={() => onToggleLike(post.id)}>
                ♥ {post.likes?.length || 0}
              </button>
            </div>

            <div className="comments-section">
              {post.comments?.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <strong>{comment.user?.name || 'User'}</strong>
                  <span>{comment.text}</span>
                </div>
              ))}
              <div className="comment-input-row">
                <input
                  type="text"
                  value={commentDrafts[post.id] || ''}
                  onChange={(event) => onCommentDraftChange(post.id, event.target.value)}
                  placeholder="Write a comment..."
                />
                <button type="button" className="primary-button" onClick={() => onSubmitComment(post.id)}>Send</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeedPage;
