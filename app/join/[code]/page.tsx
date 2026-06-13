import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ code: string }>
}

export default async function JoinPage({ params }: Props) {
  const { code } = await params
  // Redirect to homepage with referral code in query param
  // The homepage will handle storing the code for when user signs up
  redirect(`/?ref=${code}`)
}
