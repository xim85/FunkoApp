export async function lookupBarcode(barcode) {
  const base = process.env.EXPO_PUBLIC_UPC_PROXY_URL
  if (!base) throw new Error('Missing EXPO_PUBLIC_UPC_PROXY_URL')

  const url =
    `${base.replace(/\/$/, '')}` +
    `/lookup?barcode=${encodeURIComponent(barcode)}`

  const res = await fetch(url)

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Lookup failed (${res.status}) ${txt}`)
  }

  return await res.json()
}
