import { useEffect } from 'react'

export default function Companies() {
  useEffect(() => {
    // Move fetch inside useEffect
    fetch('http://localhost:3000/api/test/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'testcompany1'
      })
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error))
  }, []) // Empty dependency array means this runs once on mount

  return <div>dasda</div>
}
