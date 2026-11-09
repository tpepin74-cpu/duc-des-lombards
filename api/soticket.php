<?php
/**
 * Proxy SoTicket — Le Duc des Lombards
 * Garde le jeton JWT côté serveur, interroge l'API externe Supersoniks
 * (GET /api/v2/sessions) et renvoie au site une liste allégée de séances.
 *
 * Installation (hébergement PHP, ex. OVH) :
 *  1. Déposer ce fichier dans /api/ du site.
 *  2. Renseigner SOTICKET_TOKEN (jeton fourni par le support Supersoniks)
 *     de préférence en variable d'environnement, sinon ci-dessous.
 *  3. Communiquer l'IP du serveur au support Supersoniks (liste blanche).
 *  4. Dans assets/soticket.js : endpoint: '/api/soticket.php'
 */

const SOTICKET_BASE = 'https://supersoniks.la-billetterie.net/api/v2'; // à adapter si l'instance du Duc diffère
const CACHE_TTL     = 300; // 5 min, comme l'API

$token = getenv('SOTICKET_TOKEN') ?: '';  // ou : $token = 'JWT…';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=' . CACHE_TTL);
header('X-Robots-Tag: noindex');

if ($token === '') { http_response_code(503); echo json_encode(['error' => 'Jeton SoTicket non configuré']); exit; }

$from = isset($_GET['from']) ? (int) $_GET['from'] : time();
$to   = isset($_GET['to'])   ? (int) $_GET['to']   : time() + 60 * 86400;
$to   = min($to, $from + 120 * 86400);

$cacheFile = sys_get_temp_dir() . '/soticket_' . md5($from . '-' . $to) . '.json';
if (is_file($cacheFile) && time() - filemtime($cacheFile) < CACHE_TTL) { readfile($cacheFile); exit; }

$params = http_build_query([
  'from' => $from, 'to' => $to, 'limit' => 500, 'publication_status' => 'published',
]);
foreach (['prices', 'stock', 'status', 'settings'] as $f) $params .= '&features[]=' . $f;

$ch = curl_init(SOTICKET_BASE . '/sessions?' . $params);
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT        => 10,
  CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token, 'Accept: application/json', 'Accept-Language: fr'],
]);
$body = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($code !== 200 || !$body) {
  if (is_file($cacheFile)) { readfile($cacheFile); exit; } // ancienne donnée plutôt que rien
  http_response_code(502); echo json_encode(['error' => 'SoTicket indisponible', 'status' => $code]); exit;
}

$data = json_decode($body, true);
$list = isset($data['data']) ? $data['data'] : $data; // selon l'enveloppe renvoyée
$out = [];
foreach ((array) $list as $s) {
  $out[] = [
    'id'           => $s['id'] ?? null,
    'start_date'   => $s['start_date'] ?? null,
    'public_link'  => $s['public_link'] ?? null,
    'stock'        => array_intersect_key($s['stock'] ?? [], array_flip(['available', 'gauge', 'initial', 'sold'])),
    'infos_status' => array_intersect_key($s['infos_status'] ?? [], array_flip(['available', 'closed'])),
    'prices'       => array_map(fn($p) => array_intersect_key($p, array_flip(['id', 'name', 'label', 'amount', 'amount_display', 'price_available'])), $s['prices'] ?? []),
  ];
}
$json = json_encode($out, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
@file_put_contents($cacheFile, $json);
echo $json;
