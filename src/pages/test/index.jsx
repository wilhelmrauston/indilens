import React from 'react'

const createUser = async () => {
  console.log('Creating user...')
  try {
    const response = await fetch('/api/test/user/createUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'wil@rau.com',
        password: 'password',
        name: 'Wil Rau'
      })
    })
    const data = await response.json()
    console.log(data)

    console.log('User created:')
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

const TestPage = () => {
  return (
    <div>
      <button onClick={createUser}>Create User</button>
    </div>
  )
}

export default TestPage
