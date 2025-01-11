import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ChatBubbleLeftIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

export default function Showcase() {
  const router = useRouter()
  const { slug } = router.query
  const [userData, setUserData] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)

  const handleFollowUpdate = newFollowStatus => {
    setIsFollowing(newFollowStatus)
  }

  useEffect(() => {
    const checkFollowStatus = async () => {
      console.log('Check Follow Status - Session ID:', session?.user?.id)
      console.log('Check Follow Status - User ID:', userData?.id)
      if (!session?.user?.id || !userData?.id) return

      try {
        const response = await fetch(`/api/v1/users/${userData.id}/follow`)
        if (response.ok) {
          const data = await response.json()
          setIsFollowing(data.isFollowing)
        }
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }

    if (userData) {
      checkFollowStatus()
    }
  }, [userData, session])

  const fetchUserData = async () => {
    try {
      const userResponse = await fetch(`/api/v1/users/user/${slug}`)
      if (!userResponse.ok) throw new Error('Failed to fetch user data')

      const userData = await userResponse.json()
      console.log('API Response:', userData) // Log the full response
      console.log('User Data Structure:', userData.user) // Log the user object
      setUserData(userData.user)

      if (userData.posts?.length) {
        const postsData = await Promise.all(
          userData.posts.map(async post => {
            const [commentsRes, likesRes] = await Promise.all(
              [
                fetch(`/api/v1/posts/${post.id}/comments`).then(res =>
                  res.json()
                ),
                fetch(`/api/v1/posts/${post.id}/likes`).then(res => res.json())
              ].map(p =>
                p.catch(error => {
                  console.error(
                    `Error fetching data for post ${post.id}:`,
                    error
                  )
                  return {} // Return empty object if fetch fails
                })
              )
            )

            return {
              ...post,
              comments: commentsRes || [],
              likeCount: likesRes.count || 0,
              hasLiked: likesRes.hasLiked || false
            }
          })
        )

        setPosts(postsData)
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch session
  useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()
        setSession(data)
      } catch (error) {
        console.error('Error fetching session:', error)
      }
    }
    getSession()
  }, [])

  // Fetch user data when slug is available
  useEffect(() => {
    if (slug && session) {
      setIsLoading(true)
      fetchUserData()
    }
  }, [slug, session])

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-lg'>Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-lg'>User not found</div>
      </div>
    )
  }

  const handleLike = async (postId, isLiked) => {
    try {
      const response = await fetch(
        `/api/v1/posts/${postId}/likes${isLiked ? '/' + postId : ''}`,
        {
          method: isLiked ? 'DELETE' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update like')
      }

      const data = await response.json()

      // Update posts state with new like count
      setPosts(
        posts.map(post =>
          post.id === postId
            ? {
                ...post,
                likeCount: data.count,
                hasLiked: data.hasLiked
              }
            : post
        )
      )
    } catch (error) {
      console.error('Like error:', error)
      alert(error.message || 'Failed to update like')
    }
  }

  // In your Showcase component
  const handleComment = async (postId, content) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add comment')
      }

      // Update posts state with new comment
      setPosts(
        posts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), data]
              }
            : post
        )
      )
    } catch (error) {
      console.error('Comment error:', error)
      alert(error.message || 'Failed to add comment')
    }
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header/Profile Section */}
      <div className='bg-gradient-to-b from-gray-800 to-gray-900 py-16'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center gap-6'>
            {userData.avatarUrl ? (
              <Image
                src={userData.avatarUrl}
                alt={userData.name}
                width={96}
                height={96}
                className='rounded-full'
              />
            ) : (
              <div className='flex h-24 w-24 items-center justify-center rounded-full bg-gray-700'>
                <span className='text-2xl'>{userData.name?.[0]}</span>
              </div>
            )}
            <div>
              <h1 className='text-3xl font-bold'>{userData.name}</h1>
              <p className='text-gray-400'>{userData.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className='container mx-auto px-4 py-8'>
        <div className='space-y-6'>
          {posts.map(post => (
            <div key={post.id} className='rounded-xl bg-gray-800 p-6'>
              <div className='mb-4'>
                <h2 className='text-xl font-semibold'>{post.title}</h2>
                <p className='mt-2 text-gray-300'>{post.content}</p>
              </div>

              {/* Companies associated with this post */}
              {post.companies && (
                <div className='mt-6 space-y-4'>
                  {post.companies.map(company => (
                    <div
                      key={company.id}
                      className='rounded-lg bg-gray-700/50 p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='font-semibold'>{company.name}</h3>
                          {company.tagline && (
                            <p className='text-sm text-gray-400'>
                              {company.tagline}
                            </p>
                          )}
                        </div>
                        <div className='flex items-center gap-2'>
                          {company.status && (
                            <span className='rounded-full bg-gray-600 px-3 py-1 text-xs'>
                              {company.status.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <PostInteractions
                post={post}
                onLike={handleLike}
                isFollowing={isFollowing}
                onComment={handleComment}
                onFollowUpdate={handleFollowUpdate}
                session={session}
                userData={userData}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PostInteractions = ({
  post,
  onLike,
  onComment,
  isFollowing,
  onFollowUpdate,
  userData,
  session
}) => {
  const [comment, setComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editContent, setEditContent] = useState('')

  const handleSubmitComment = async () => {
    if (!comment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onComment(post.id, comment)
      setComment('')
      // Keep comments visible after posting
      setShowComments(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await fetch(
        `/api/v1/posts/${post.id}/comments/${commentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update comment')
      }

      const updatedComment = await response.json()

      // Update local state
      post.comments = post.comments.map(c =>
        c.id === commentId ? updatedComment : c
      )

      // Reset edit state
      setEditingCommentId(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating comment:', error)
      alert(error.message)
    }
  }

  const handleDeleteComment = async commentId => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    try {
      const response = await fetch(
        `/api/v1/posts/${post.id}/comments/${commentId}`,
        {
          method: 'DELETE'
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete comment')
      }

      // Update local state
      post.comments = post.comments.filter(c => c.id !== commentId)
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert(error.message)
    }
  }

  return (
    <div className='mt-4 border-t border-gray-700 pt-4'>
      {/* Like/Comment buttons section */}
      <div className='flex items-center justify-between gap-4'>
        <div className='flex flex-row gap-4'>
          <button
            onClick={() => onLike(post.id, post.hasLiked)}
            className={`flex items-center gap-2 text-sm ${
              post.hasLiked
                ? 'text-pink-500'
                : 'text-gray-400 hover:text-pink-500'
            }`}
          >
            <HeartIcon
              className={`h-5 w-5 ${post.hasLiked ? 'fill-current' : 'stroke-2'}`}
            />
            <span>{post.likeCount || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className='flex items-center gap-2 text-sm text-gray-400 hover:text-white'
          >
            <ChatBubbleLeftIcon className='h-5 w-5' />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>
        {session?.user?.id &&
          userData?.id &&
          session.user.id !== userData.id && (
            <FollowButton
              userId={userData.id}
              initialIsFollowing={isFollowing}
              onFollowUpdate={onFollowUpdate}
            />
          )}
      </div>

      {/* Comments section */}
      {showComments && (
        <div className='mt-4 space-y-4'>
          {/* Comments list */}
          <div className='space-y-3'>
            {post.comments?.map(comment => (
              <div key={comment.id} className='rounded-lg bg-gray-700/30 p-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-600'>
                    <span className='text-xs'>{comment.author.name[0]}</span>
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium'>
                          {comment.author.name}
                        </span>
                        <span className='text-xs text-gray-400'>
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {session?.user?.id === comment.author.id && (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id)
                              setEditContent(comment.content)
                            }}
                            className='text-gray-400 hover:text-white'
                          >
                            <PencilIcon className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className='text-gray-400 hover:text-red-500'
                          >
                            <TrashIcon className='h-4 w-4' />
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className='mt-2 flex gap-2'>
                        <input
                          type='text'
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className='flex-1 rounded-lg bg-gray-600 px-3 py-1 text-sm'
                        />
                        <button
                          onClick={() =>
                            handleEditComment(comment.id, editContent)
                          }
                          className='rounded-lg bg-[#F6B17A] px-3 py-1 text-sm font-medium text-gray-900'
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null)
                            setEditContent('')
                          }}
                          className='rounded-lg bg-gray-600 px-3 py-1 text-sm'
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className='text-sm text-gray-300'>{comment.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <div className='flex items-center gap-2'>
            <input
              type='text'
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                  handleSubmitComment()
                }
              }}
              placeholder='Add a comment...'
              className='flex-1 rounded-lg bg-gray-700 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6B17A]'
            />
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !comment.trim()}
              className='rounded-lg bg-[#F6B17A] px-4 py-2 text-sm font-medium text-gray-900 hover:bg-[#f0a467] disabled:opacity-50'
            >
              {isSubmitting ? 'Commenting...' : 'Comment'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const FollowButton = ({
  userId,
  initialIsFollowing = false,
  onFollowUpdate
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  const handleFollow = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update follow status')
      }

      const data = await response.json()
      setIsFollowing(data.isFollowing)
      onFollowUpdate?.(data.isFollowing)
    } catch (error) {
      console.error('Follow error:', error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 text-sm transition-colors duration-200 ${
        isFollowing ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'
      } disabled:opacity-50`}
    >
      <span>
        {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
      </span>
    </button>
  )
}
