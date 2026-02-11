import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.WP_URL
  const username = process.env.WP_USERNAME
  const password = process.env.WP_APP_PASSWORD

  if (!url || !username || !password) {
    return NextResponse.json({ connected: false, url: '' })
  }

  try {
    const res = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      },
    })
    return NextResponse.json({
      connected: res.ok,
      url,
    })
  } catch {
    return NextResponse.json({ connected: false, url })
  }
}
