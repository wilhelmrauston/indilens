import Head from 'next/head'
import AuthForm from './login'

export default function Login() {
  return (
    <>
      <Head>
        <title>Join Indilens</title>
        <meta property='og:title' content='Join Indilens' />
        <meta property='og:description' content='A platform ' />
      </Head>
      <AuthForm />
    </>
  )
}
