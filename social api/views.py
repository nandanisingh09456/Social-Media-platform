import json
from datetime import datetime

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods


DEFAULT_USERS = [
    {'id': 1, 'username': 'alice', 'name': 'Alice Chen', 'avatar': 'https://i.pravatar.cc/150?img=47', 'bio': 'Product designer • coffee lover', 'followers': 1240, 'following': 320, 'isFollowing': False},
    {'id': 2, 'username': 'bob', 'name': 'Bob Rivera', 'avatar': 'https://i.pravatar.cc/150?img=12', 'bio': 'Frontend engineer • building cool stuff', 'followers': 980, 'following': 210, 'isFollowing': True},
    {'id': 3, 'username': 'maria', 'name': 'Maria Lopez', 'avatar': 'https://i.pravatar.cc/150?img=32', 'bio': 'Travel photographer', 'followers': 560, 'following': 180, 'isFollowing': False},
]

DEFAULT_POSTS = [
    {
        'id': 101,
        'content': 'Launching a new social experience with a beautiful, responsive layout. What do you think?',
        'image': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
        'createdAt': '2026-07-02T08:30:00Z',
        'author': DEFAULT_USERS[0],
        'likes': [2],
        'comments': [
            {'id': 1, 'user': DEFAULT_USERS[1], 'text': 'Looks amazing!'},
        ],
    },
    {
        'id': 102,
        'content': 'Designing a compact feed for creators and communities.',
        'image': '',
        'createdAt': '2026-07-02T06:15:00Z',
        'author': DEFAULT_USERS[1],
        'likes': [1, 3],
        'comments': [
            {'id': 2, 'user': DEFAULT_USERS[2], 'text': 'Love the vibes.'},
        ],
    },
]


def _serialize_user(user_obj, current_user=None):
    if isinstance(user_obj, dict):
        return user_obj
    return {
        'id': user_obj.id,
        'username': user_obj.username,
        'name': user_obj.get_full_name() or user_obj.username.title(),
        'avatar': 'https://i.pravatar.cc/150?img=47',
        'bio': 'Member of the social platform',
        'followers': 0,
        'following': 0,
        'isFollowing': False,
    }


def _serialize_post(post, current_user=None):
    return {
        'id': post['id'],
        'content': post['content'],
        'image': post['image'],
        'createdAt': post['createdAt'],
        'author': post['author'],
        'likes': post['likes'],
        'comments': post['comments'],
        'likedByMe': current_user is not None and current_user in post['likes'],
    }


@require_http_methods(['POST'])
def login_view(request):
    payload = json.loads(request.body or b'{}')
    username = payload.get('username', '').strip()
    password = payload.get('password', '').strip()

    user = authenticate(request, username=username, password=password)
    if user is None:
        if username == 'alice' and password == 'password':
            user, _ = User.objects.get_or_create(username='alice', defaults={'is_staff': False, 'is_active': True})
            user.set_password('password')
            user.save()
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'token': f'token-{user.username}', 'user': _serialize_user(user)})


@require_http_methods(['GET'])
def me_view(request):
    token = request.headers.get('Authorization', '')
    if not token.startswith('Bearer '):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    username = token.split(' ', 1)[1].replace('token-', '')
    user = User.objects.filter(username=username).first()
    if user is None:
        user = User.objects.create_user(username=username, password='password')
    return JsonResponse({'user': _serialize_user(user)})


@require_http_methods(['GET'])
def users_view(request):
    return JsonResponse(DEFAULT_USERS, safe=False)


@require_http_methods(['GET'])
def posts_view(request):
    return JsonResponse([_serialize_post(post, current_user=None) for post in DEFAULT_POSTS], safe=False)


@require_http_methods(['POST'])
def like_post(request, post_id):
    for post in DEFAULT_POSTS:
        if post['id'] == post_id:
            if 1 not in post['likes']:
                post['likes'].append(1)
            else:
                post['likes'].remove(1)
            return JsonResponse(_serialize_post(post, current_user=1))
    return JsonResponse({'error': 'Post not found'}, status=404)


@require_http_methods(['POST'])
def comment_post(request, post_id):
    payload = json.loads(request.body or b'{}')
    text = (payload.get('text') || '').strip()
    if not text:
        return JsonResponse({'error': 'Comment text is required'}, status=400)
    for post in DEFAULT_POSTS:
        if post['id'] == post_id:
            post['comments'].append({'id': int(datetime.utcnow().timestamp()), 'user': DEFAULT_USERS[0], 'text': text})
            return JsonResponse(_serialize_post(post, current_user=1))
    return JsonResponse({'error': 'Post not found'}, status=404)


@require_http_methods(['POST'])
def follow_user(request, user_id):
    target_user = next((user for user in DEFAULT_USERS if user['id'] == user_id), None)
    if target_user is None:
        return JsonResponse({'error': 'User not found'}, status=404)
    target_user['isFollowing'] = not target_user['isFollowing']
    target_user['followers'] += 1 if target_user['isFollowing'] else -1
    return JsonResponse({'currentUser': DEFAULT_USERS[0], 'targetUser': target_user})
