import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className='h-screen w-full flex justify-center items-center bg-black/60'>
      <SignIn />
    </div>
  )
}
