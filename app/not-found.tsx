import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center bg-black text-white">
      <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
      <p className="mb-8 text-gray-400">The page you are looking for doesn&apos;t exist.</p>
      <Link href="/" className="bg-teal-500 text-black px-4 py-2 rounded-md hover:bg-teal-400 transition-colors">
        Return Home
      </Link>
    </div>
  )
} 