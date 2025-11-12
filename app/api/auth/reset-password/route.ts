import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { token, tokenHash, password } = await request.json()
    
    // Create a Supabase client for server-side operations
    const supabase = await createClient()

    // Verify the reset token
    let verifyResult
    if (tokenHash) {
      verifyResult = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      })
    } else if (token) {
      // For direct tokens, we need to use token_hash format
      verifyResult = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      })
    } else {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 400 }
      )
    }

    if (verifyResult.error) {
      return NextResponse.json(
        { error: verifyResult.error.message },
        { status: 400 }
      )
    }

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    })

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')
    const tokenHash = searchParams.get('token_hash')
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    const type = searchParams.get('type')

    // Create a Supabase client for server-side operations
    const supabase = await createClient()

    // Handle different token types
    if (accessToken && refreshToken && type === 'recovery') {
      // Direct session from email link
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      
      if (error) {
        return NextResponse.redirect(
          new URL(`/auth/reset-password?error=${encodeURIComponent(error.message)}`, request.url)
        )
      }
    } else if (token || tokenHash) {
      // Verify OTP token
      let verifyResult
      if (tokenHash) {
        verifyResult = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        })
      } else if (token) {
        verifyResult = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        })
      }

      if (verifyResult?.error) {
        return NextResponse.redirect(
          new URL(`/auth/reset-password?error=${encodeURIComponent(verifyResult.error.message)}`, request.url)
        )
      }
    }

    // Redirect to the reset password page without any tokens
    return NextResponse.redirect(new URL('/auth/reset-password', request.url))
  } catch (error) {
    console.error('Reset password validation error:', error)
    return NextResponse.redirect(
      new URL(`/auth/reset-password?error=${encodeURIComponent('Invalid or expired reset link')}`, request.url)
    )
  }
}