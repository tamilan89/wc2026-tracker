// Cloudflare Pages Function
// Proxies requests from /api/fd/* to https://api.football-data.org/*
// Keeps the X-Auth-Token secret on the server side and avoids browser CORS issues.
//
// IMPORTANT: Set FD_TOKEN as an environment variable in your Cloudflare Pages
// project settings (Settings -> Environment variables), instead of hardcoding it.
// As a fallback for quick testing, the token below is used if FD_TOKEN is not set.

const FALLBACK_TOKEN = 'a7918ef47f08457590d7b16f783855f8';

export async function onRequest(context) {
  const { request, env, params } = context;

  const path = Array.isArray(params.path) ? params.path.join('/') : (params.path || '');
  const incomingUrl = new URL(request.url);
  const targetUrl = `https://api.football-data.org/${path}${incomingUrl.search}`;

  const token = (env && env.FD_TOKEN) ? env.FD_TOKEN : FALLBACK_TOKEN;

  const upstream = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'X-Auth-Token': token
    }
  });

  const body = await upstream.text();

  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
