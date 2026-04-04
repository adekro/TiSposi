/**
 * Script one-time per ottenere il refresh token OAuth2 di Google.
 *
 * Prerequisiti:
 *   1. Vai su https://console.cloud.google.com/
 *   2. Crea (o riusa) un progetto, abilita "Google Drive API"
 *   3. Credenziali > Crea credenziali > ID client OAuth 2.0
 *      - Tipo: Applicazione desktop
 *   4. Copia Client ID e Client Secret qui sotto o passali come env var
 *   5. Esegui:  node scripts/get-refresh-token.mjs
 *   6. Apri il link, autorizza, incolla il codice
 *   7. Copia il refresh_token nelle env var di Vercel
 */

import { createServer } from 'http'
import { google } from 'googleapis'
import readline from 'readline'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    '\nErrore: imposta le variabili prima di eseguire lo script:\n' +
    '  $env:GOOGLE_CLIENT_ID="..."\n' +
    '  $env:GOOGLE_CLIENT_SECRET="..."\n',
  )
  process.exit(1)
}

const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',         // forza la restituzione del refresh_token
  scope: [
    'https://www.googleapis.com/auth/drive.file',
  ],
})

console.log('\n╔══════════════════════════════════════════════════════════╗')
console.log('║          Procedura per ottenere il Refresh Token          ║')
console.log('╚══════════════════════════════════════════════════════════╝\n')
console.log('1. Apri questo URL nel browser (copia e incolla):')
console.log('\n' + authUrl + '\n')
console.log('2. Accedi con l\'account Google che ha il Drive con 5TB')
console.log('3. Autorizza l\'app')
console.log('4. Copia il codice visualizzato sulla pagina\n')

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
rl.question('Incolla il codice qui: ', async (code) => {
  rl.close()
  try {
    const { tokens } = await oauth2Client.getToken(code.trim())
    console.log('\n✅  Credenziali ottenute!\n')
    console.log('Aggiungi queste variabili d\'ambiente su Vercel:')
    console.log('──────────────────────────────────────────────')
    console.log(`GOOGLE_CLIENT_ID     = ${CLIENT_ID}`)
    console.log(`GOOGLE_CLIENT_SECRET = ${CLIENT_SECRET}`)
    console.log(`GOOGLE_REFRESH_TOKEN = ${tokens.refresh_token}`)
    console.log('──────────────────────────────────────────────')
    if (!tokens.refresh_token) {
      console.warn(
        '\n⚠️  refresh_token non presente. Rimuovi i permessi all\'app da ' +
        'https://myaccount.google.com/permissions e riesegui lo script.\n',
      )
    }
  } catch (err) {
    console.error('\nErrore nello scambio del codice:', err.message)
  }
})
