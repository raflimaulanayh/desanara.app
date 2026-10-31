'use client'

import { createUmkmAuthClient } from '@repo/auth/client'
import { API_URL } from './env'

export const authClient = createUmkmAuthClient(API_URL)
