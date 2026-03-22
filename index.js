export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname !== '/lookup') {
      return new Response('Not found', { status: 404 })
    }

    const barcode = (url.searchParams.get('barcode') || '').trim()
    if (!barcode) {
      return Response.json({ error: 'barcode-required' }, { status: 400 })
    }

    const apiUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`
    const res = await fetch(apiUrl, {
      headers: { key: env.UPCITEMDB_KEY }
    })

    if (!res.ok) {
      return Response.json(
        { error: 'upcitemdb-failed', status: res.status },
        { status: 502 }
      )
    }

    const json = await res.json()
    const first = json?.items?.[0] ?? null

    return Response.json({
      found: !!first,
      title: first?.title ?? null,
      brand: first?.brand ?? null,
      images: Array.isArray(first?.images) ? first.images : []
    })
  }
}
