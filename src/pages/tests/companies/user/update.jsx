import { useEffect } from 'react'

export default function Companies() {
  useEffect(() => {
    // Move fetch inside useEffect
    fetch('http://localhost:3000/api/test/companies', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: 1,
        tagline: 'this company blows',
        description: 'this company used to blow a lot of load',
        logo: 'somelogourl',
        website: 'rauston.se',
        industry: 'tech',
        status: 'LAUNCHED',
        githubUrl: 'some github url',
        demoUrl: 'some demo url',
        techStack: ['react', 'nextjs'],
        launched: '2024-01-02'
      })
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Error:', error))
  }, []) // Empty dependency array means this runs once on mount

  return <div>dasda</div>
}
