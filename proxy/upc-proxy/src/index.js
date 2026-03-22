function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET,OPTIONS',
		'Access-Control-Allow-Headers': 'Authorization,Content-Type',
	};
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders() });
		}

		const isLookup = url.pathname === '/lookup' || url.pathname === '/lookup/';

		if (!isLookup) {
			return new Response('Not found', { status: 404, headers: corsHeaders() });
		}

		const barcode = (url.searchParams.get('barcode') || '').trim();
		if (!barcode) {
			return Response.json({ error: 'barcode-required' }, { status: 400, headers: corsHeaders() });
		}

		const apiUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(barcode)}`;
		const res = await fetch(apiUrl, {
			headers: { key: env.UPCITEMDB_KEY },
		});

		if (!res.ok) {
			return Response.json({ error: 'upcitemdb-failed', status: res.status }, { status: 502, headers: corsHeaders() });
		}

		const json = await res.json();
		const first = json?.items?.[0] ?? null;

		return Response.json(
			{
				found: !!first,
				title: first?.title ?? null,
				brand: first?.brand ?? null,
				images: Array.isArray(first?.images) ? first.images : [],
			},
			{ headers: corsHeaders() },
		);
	},
};
