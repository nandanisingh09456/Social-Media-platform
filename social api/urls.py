from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login_view, name='login'),
    path('me', views.me_view, name='me'),
    path('users', views.users_view, name='users'),
    path('posts', views.posts_view, name='posts'),
    path('posts/<int:post_id>/like', views.like_post, name='like_post'),
    path('posts/<int:post_id>/comment', views.comment_post, name='comment_post'),
    path('follow/<int:user_id>', views.follow_user, name='follow_user'),
]
